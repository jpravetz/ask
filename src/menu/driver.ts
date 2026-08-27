import { ReturnToMainMenuError } from '$errors';
import type { KeyBinding } from '$types';
import type * as Opts from '$opts';
import * as colors from '@std/fmt/colors';
import type { Ask } from '../ask.ts';
import type { Actions } from './actions.ts';
import { NAV_KEYS } from './navkeys.ts';
import { BACK, EXIT, FORWARD, isNavigationSignal, type NavigationSignal, REDISPLAY } from './signals.ts';
import {
  isNodeRef,
  type MenuAction,
  type MenuChoice,
  type MenuNode,
  type MenuResult,
  type MenuTree,
} from './types.ts';

/**
 * A key binding that may optionally carry a human-readable hint. Hints are
 * rendered in a footer below the menu choices so that "hidden" universal key
 * bindings remain discoverable.
 */
export type KeyBindingHint = KeyBinding & { hint?: string };

/**
 * Options for `runMenu`.
 */
export type RunMenuOpts<C> = {
  /**
   * The shared context passed to every menu node and action (typically an
   * application "shell" that holds state and helper methods).
   */
  ctx: C;
  /**
   * The `Ask` instance used to render the menus.
   */
  ask: Ask;
  /**
   * The action registry used to resolve named actions (both `action` strings in
   * choices and key binding values).
   */
  actions?: Actions<C>;
  /**
   * The id of the root node. Defaults to `'root'`.
   */
  root?: string;
  /**
   * Whether numbers `1-9` are displayed and accepted for menu choices. Defaults
   * to `true`.
   */
  useNumbers?: boolean;
  /**
   * Universal key bindings that are active in every menu, regardless of the
   * current node. They are merged before `NAV_KEYS` and any per-node bindings.
   * A binding value may be a navigation signal, a `NodeRef`, or the name of a
   * registered action.
   */
  keyBindings?: KeyBindingHint[];
  /**
   * Whether to render the key-binding hint footer below the menu choices. May
   * be a function of the context so it can be toggled dynamically (e.g. by a
   * menu action). Defaults to `true` when key bindings provide hints.
   */
  showKeyBindings?: boolean | ((ctx: C) => boolean);
};

type Resolution<C> =
  | { type: 'stay' }
  | { type: 'signal'; value: NavigationSignal }
  | { type: 'node'; node: string }
  | { type: 'action'; name: string }
  | { type: 'run'; fn: MenuAction<C> };

function keyLabel(binding: KeyBindingHint): string {
  const mod = binding.modifier === 'alt' ? 'Alt' : 'Ctrl';
  const key = binding.key.length === 1 ? binding.key.toUpperCase() : binding.key;
  return `${mod}-${key} ${binding.hint}`;
}

function buildFooter(
  keyBindings: KeyBindingHint[] | undefined,
  showKeyBindings: boolean,
): string | undefined {
  if (!showKeyBindings) {
    return undefined;
  }
  const hints = (keyBindings ?? []).filter((kb) => kb.hint && kb.hint.length > 0);
  if (hints.length === 0) {
    return undefined;
  }
  // A leading newline separates the hint footer from the menu choices by a
  // blank line.
  return '\n' + colors.gray(hints.map(keyLabel).join('   '));
}

function resolveSelect<C>(
  value: unknown,
  tokens: Map<symbol, MenuChoice<C>>,
  actions: Actions<C> | undefined,
): Resolution<C> {
  if (value === undefined) {
    return { type: 'signal', value: BACK };
  }
  if (isNavigationSignal(value)) {
    return { type: 'signal', value };
  }
  if (isNodeRef(value)) {
    return { type: 'node', node: value.node };
  }
  if (typeof value === 'symbol') {
    const choice = tokens.get(value);
    if (choice) {
      if (choice.node) {
        return { type: 'node', node: choice.node };
      }
      if (typeof choice.action === 'string') {
        return { type: 'action', name: choice.action };
      }
      if (typeof choice.action === 'function') {
        return { type: 'run', fn: choice.action };
      }
    }
    return { type: 'stay' };
  }
  if (actions && actions.isActionName(value)) {
    return { type: 'action', name: value };
  }
  return { type: 'stay' };
}

function resolveResult<C>(value: MenuResult<C>): Resolution<C> {
  if (value === undefined) {
    return { type: 'stay' };
  }
  if (isNavigationSignal(value)) {
    return { type: 'signal', value };
  }
  if (isNodeRef(value)) {
    return { type: 'node', node: value.node };
  }
  return { type: 'stay' };
}

/**
 * Runs an interactive menu session driven by a `MenuTree`.
 *
 * Navigation is structural: choosing a choice with a `node` reference descends
 * into a submenu (pushing the current menu onto the history stack), `BACK` /
 * `ESC` / `←` returns to the parent, and `→` moves forward again. `BACK` at the
 * root is a no-op. Running an action re-renders the current menu by default
 * unless the action returns a navigation signal or a `NodeRef`. Pressing `0`
 * when `returnToMainMenu` is enabled throws `ReturnToMainMenuError`, which
 * resets the session to the root.
 */
export async function runMenu<C>(tree: MenuTree<C>, opts: RunMenuOpts<C>): Promise<void> {
  const { ctx, ask, actions } = opts;
  const root = opts.root ?? 'root';
  const history: string[] = [];
  const forwardStack: string[] = [];
  let current = root;

  const render = async (nodeId: string): Promise<Resolution<C>> => {
    const node: MenuNode<C> = tree[nodeId];
    if (!node) {
      throw new Error(`Unknown menu node '${nodeId}'.`);
    }
    const message = typeof node.message === 'function' ? await node.message(ctx) : node.message ?? nodeId;
    const choiceList = typeof node.choices === 'function' ? await node.choices(ctx) : node.choices;

    const tokens = new Map<symbol, MenuChoice<C>>();
    let defaultToken: symbol | undefined;
    const choices = choiceList.map((choice) => {
      const token = Symbol(typeof choice.message === 'string' ? choice.message : nodeId);
      tokens.set(token, choice);
      if (choice.default) {
        defaultToken = token;
      }
      return {
        message: typeof choice.message === 'function' ? choice.message(ctx) : choice.message,
        value: token,
        disabled: typeof choice.disabled === 'function' ? choice.disabled(ctx) : choice.disabled,
      };
    });

    const keyBindings: KeyBinding[] = [
      ...(opts.keyBindings ?? []),
      ...NAV_KEYS,
      ...(node.keyBindings ?? []),
    ];
    const showKeyBindings = typeof opts.showKeyBindings === 'function'
      ? opts.showKeyBindings(ctx)
      : (opts.showKeyBindings ?? true);
    const footer = buildFooter(opts.keyBindings, showKeyBindings);

    const selectOpts: Opts.Select = {
      name: 'action',
      message,
      choices,
      keyBindings,
      footer,
      useNumbers: node.useNumbers ?? opts.useNumbers ?? true,
      ...node.selectOpts,
      default: defaultToken ?? node.selectOpts?.default,
    };

    const result = await ask.select(selectOpts);

    return resolveSelect(result?.action, tokens, actions);
  };

  while (true) {
    try {
      let res = await render(current);

      while (res.type === 'action' || res.type === 'run') {
        const out = res.type === 'action' ? await actions!.run(ctx, res.name) : await res.fn(ctx);
        res = resolveResult(out);
      }

      if (res.type === 'signal' && res.value === REDISPLAY) {
        res = { type: 'stay' };
      }

      if (res.type === 'stay') {
        continue;
      }

      if (res.type === 'node') {
        forwardStack.length = 0;
        history.push(current);
        current = res.node;
        continue;
      }

      if (res.type === 'signal') {
        if (res.value === EXIT) {
          break;
        }
        if (res.value === BACK) {
          if (history.length > 0) {
            forwardStack.push(current);
            current = history.pop()!;
          }
          // At the root there is nothing to go back to, so BACK is a no-op.
          continue;
        }
        if (res.value === FORWARD) {
          if (forwardStack.length > 0) {
            history.push(current);
            current = forwardStack.pop()!;
          }
          continue;
        }
        continue;
      }
    } catch (err) {
      if (err instanceof ReturnToMainMenuError) {
        current = root;
        history.length = 0;
        forwardStack.length = 0;
        continue;
      }
      throw err;
    }
  }
}

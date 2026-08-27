import type * as Opts from '$opts';
import type { KeyBinding } from '$types';
import type { NavigationSignal } from './signals.ts';

/**
 * A reference to a named menu node in a `MenuTree`.
 */
export type NodeRef = {
  node: string;
};

/**
 * Type guard that checks whether a value is a `NodeRef`.
 */
export function isNodeRef(val: unknown): val is NodeRef {
  return typeof val === 'object' && val !== null && typeof (val as NodeRef).node === 'string';
}

/**
 * The result of running a menu action.
 * - a `NavigationSignal` (`BACK`, `FORWARD`, `EXIT`, `REDISPLAY`)
 * - a `NodeRef` to navigate to another named node
 * - `void` / `undefined` to re-render the current menu
 */
export type MenuResult<C> = NavigationSignal | NodeRef | void;

/**
 * A function that implements a menu action. It receives the shared menu
 * context `C` (typically an application "shell") and returns a `MenuResult`.
 * May be synchronous or asynchronous.
 */
export type MenuAction<C> = (ctx: C) => MenuResult<C> | void | Promise<MenuResult<C> | void>;

/**
 * A single choice in a menu.
 *
 * Each choice either navigates to a submenu (`node`) or runs an action
 * (`action`, either a named action from an `Actions` registry or an inline
 * function). `message` and `disabled` may be functions of the context so that
 * menus can be built dynamically on every render.
 */
export type MenuChoice<C> = {
  /**
   * The choice label. May be a function of the context.
   */
  message: string | ((ctx: C) => string);
  /**
   * Whether the choice is disabled. May be a function of the context.
   */
  disabled?: boolean | ((ctx: C) => boolean);
  /**
   * Whether this choice should be the initially active (highlighted) choice
   * when the menu is rendered.
   */
  default?: boolean;
  /**
   * The id of a menu node in the tree to navigate to when this choice is
   * selected. Selecting it pushes the current menu onto the history stack.
   */
  node?: string;
  /**
   * The action to run when this choice is selected. Either the name of an
   * action registered with the `Actions` registry passed to the driver, or an
   * inline function. After the action resolves, the current menu is re-rendered
   * unless the action returned a navigation result.
   */
  action?: string | MenuAction<C>;
};

/**
 * A menu node. Renders a list of choices via `ask.select`.
 *
 * `message` and `choices` may be functions of the context so that the menu can
 * be assembled dynamically (e.g. conditional choices, computed labels) on every
 * render.
 */
export type MenuNode<C> = {
  /**
   * The prompt message shown above the choices. May be a function of the
   * context. Defaults to the node id.
   */
  message?: string | ((ctx: C) => string | Promise<string>);
  /**
   * The choices to display. May be a function of the context.
   */
  choices: MenuChoice<C>[] | ((ctx: C) => MenuChoice<C>[] | Promise<MenuChoice<C>[]>);
  /**
   * Whether numbers `1-9` are displayed and accepted for the choices. Defaults
   * to the driver's `useNumbers` option (itself defaulting to `true`).
   */
  useNumbers?: boolean;
  /**
   * Extra key bindings specific to this menu, merged after the driver's
   * universal key bindings.
   */
  keyBindings?: KeyBinding[];
  /**
   * Additional `ask.select` options passed through unchanged (formatters,
   * `columns`, `default`, and so on).
   */
  selectOpts?: Partial<Opts.Select>;
};

/**
 * A collection of named menu nodes.
 */
export type MenuTree<C> = Record<string, MenuNode<C>>;

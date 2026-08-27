import type { MenuAction, MenuResult } from './types.ts';

/**
 * A map of action names to their handlers.
 */
export type ActionDef<C> = Record<string, MenuAction<C>>;

/**
 * The runtime object returned by `createActions`.
 */
export type Actions<C> = {
  /**
   * A type-safe constant mirroring the keys of the action definitions. Used to
   * reference actions by name (e.g. a choice's `action` or a key binding's
   * value) with compile-time checking and no string duplication.
   */
  Action: { [K in keyof ActionDef<C> & string]: K };
  /**
   * The raw action definitions.
   */
  defs: ActionDef<C>;
  /**
   * Type guard that checks whether a value names one of the registered actions.
   */
  isActionName(val: unknown): val is keyof ActionDef<C> & string;
  /**
   * Runs a registered action by name and returns its result.
   */
  run(ctx: C, name: string): Promise<MenuResult<C> | void>;
};

/**
 * Creates a type-safe action registry for a menu context type.
 *
 * @example
 * ```ts
 * const actions = createActions<Shell>({
 *   reload: async (shell) => { await shell.reloadSettings(); },
 *   exit: () => EXIT,
 * });
 * // actions.Action.reload === 'reload'
 * ```
 */
export function createActions<C>(defs: ActionDef<C>): Actions<C> {
  type ActionKey = keyof ActionDef<C> & string;

  const Action = Object.fromEntries(
    Object.keys(defs).map((key) => [key, key]),
  ) as Actions<C>['Action'];

  function isActionName(val: unknown): val is ActionKey {
    return typeof val === 'string' && val in defs;
  }

  async function run(ctx: C, name: string): Promise<MenuResult<C> | void> {
    const fn = defs[name];
    if (!fn) {
      return undefined;
    }
    return await fn(ctx);
  }

  return { Action, defs, isActionName, run };
}

/**
 * A declarative menu framework for interactive command-line applications.
 *
 * Menus are described as a tree of nodes; navigation (submenus, back, forward,
 * exit) is derived from the tree structure by the `runMenu` driver instead of
 * being orchestrated by hand.
 */

export { createActions } from './actions.ts';
export type { ActionDef, Actions } from './actions.ts';
export { runMenu } from './driver.ts';
export type { KeyBindingHint, RunMenuOpts } from './driver.ts';
export { NAV_KEYS } from './navkeys.ts';
export { BACK, EXIT, FORWARD, isNavigationSignal, REDISPLAY } from './signals.ts';
export type { NavigationSignal } from './signals.ts';
export { isNodeRef } from './types.ts';
export type { MenuAction, MenuChoice, MenuNode, MenuResult, MenuTree, NodeRef } from './types.ts';

/**
 * Navigation signals returned by a menu action (or produced by the menu
 * driver) to control how the driver should proceed.
 */

/**
 * Signals that the user (or an action) wants to navigate back to the previous
 * menu in the history stack.
 */
export const BACK: symbol = Symbol('BACK');

/**
 * Signals that the user (or an action) wants to re-enter a menu that was
 * previously left via `BACK` (browser-style forward).
 */
export const FORWARD: symbol = Symbol('FORWARD');

/**
 * Signals that the interactive menu session should end.
 */
export const EXIT: symbol = Symbol('EXIT');

/**
 * Signals that the current menu should be displayed again.
 *
 * Retained for compatibility with code that returns an explicit "re-display"
 * signal. The menu driver treats it as a no-op: the default behavior after
 * running an action is already to re-render the current menu.
 */
export const REDISPLAY: symbol = Symbol('REDISPLAY');

/**
 * The union of all navigation signals.
 */
export type NavigationSignal = symbol;

/**
 * Type guard that checks whether a value is a navigation signal.
 */
export function isNavigationSignal(val: unknown): val is NavigationSignal {
  return val === BACK || val === FORWARD || val === EXIT || val === REDISPLAY;
}

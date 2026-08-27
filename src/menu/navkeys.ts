import type { KeyBinding } from '$types';
import { BACK, FORWARD } from './signals.ts';

/**
 * A preset of key bindings that map the left and right arrow keys to the
 * `BACK` and `FORWARD` navigation signals. Used by the menu driver by default
 * so that `←` and `→` navigate between menus out of the box.
 */
export const NAV_KEYS: KeyBinding[] = [
  { key: 'left', value: BACK },
  { key: 'right', value: FORWARD },
];

import * as colors from '@std/fmt/colors';
import { ListItem } from './list.ts';

/**
 * A separator in a list. You can use this to visually separate groups of items
 * in a list. The separator is always disabled and cannot be selected.
 *
 * You can change the message of the separator by passing a string to the
 * constructor. If you don't pass a message, the separator will be a line of
 * 16 dashes.
 */
export class SeparatorItem extends ListItem {
  constructor(message?: string) {
    super({
      message: message ?? colors.gray(' ' + '-'.repeat(16)),
      disabled: true,
      selected: false,
      active: false,
      disabledFormatter: (message: string) => message,
    });
  }
}

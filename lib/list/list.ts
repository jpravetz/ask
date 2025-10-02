import { Fmt } from '$fmt';
import type * as List from './types.ts';

export class ListItem {
  /**
   * The text that will be displayed as the item in the terminal UI.
   */
  message: string;

  /**
   * The value of the item.
   */
  value: unknown;

  /**
   * Whether the item is disabled.
   */
  disabled: boolean;

  /**
   * Whether the item is selected.
   */
  selected: boolean;

  /**
   * Whether the item is active. An active item is the one where the cursor is
   * currently located.
   */
  active: boolean;

  /**
   * The prefix that will be displayed in front of the message when the item is
   * selected.
   */
  selectedPrefix: string = '';

  /**
   * The prefix that will be displayed in front of the message when the item is
   * not selected.
   */
  unselectedPrefix: string = '';

  /**
   * A function that formats the message when the item is inactive.
   */
  inactiveFormatter: (message: string, selected: boolean) => string;

  /**
   * A function that formats the message when the item is active.
   */
  activeFormatter: (message: string, selected: boolean) => string;

  /**
   * A function that formats the message when the item is disabled.
   */
  disabledFormatter: (message: string, selected: boolean) => string;

  constructor(opts: List.ItemOpts) {
    this.message = opts.message;
    this.value = opts.value;
    this.disabled = opts.disabled ?? false;
    this.selected = opts.selected ?? false;
    this.active = opts.active ?? false;
    this.selectedPrefix = opts.selectedPrefix ?? '';
    this.unselectedPrefix = opts.unselectedPrefix ?? '';
    this.inactiveFormatter = opts.inactiveFormatter ?? this.defaultInactiveFormatter;
    this.activeFormatter = opts.activeFormatter ?? this.defaultActiveFormatter;
    this.disabledFormatter = opts.disabledFormatter ?? this.defaultDisabledFormatter;
  }

  /**
   * The full message is the message with the selected/unselected prefix at the
   * beginning of the string.
   */
  get fullMessage(): string {
    return this.getPrefix() + this.message;
  }

  getPrefix(): string {
    return this.selected ? this.selectedPrefix : this.unselectedPrefix;
  }

  protected defaultInactiveFormatter(message: string): string {
    return Fmt.inactive(message);
  }

  protected defaultActiveFormatter(message: string): string {
    return Fmt.active(message);
  }

  protected defaultDisabledFormatter(message: string): string {
    return Fmt.disabled(message);
  }

  /**
   * Will build the format string of the item based on its state.
   */
  format(): string {
    if (this.disabled) {
      return this.disabledFormatter(this.fullMessage, this.selected);
    }

    if (this.active) {
      return this.activeFormatter(this.fullMessage, this.selected);
    }

    return this.inactiveFormatter(this.fullMessage, this.selected);
  }
}

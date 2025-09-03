import * as colors from '@std/fmt/colors';

/**
 * A single item in a list.
 */
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
  inactiveFormatter: (message: string) => string;

  /**
   * A function that formats the message when the item is active.
   */
  activeFormatter: (message: string) => string;

  /**
   * A function that formats the message when the item is disabled.
   */
  disabledFormatter: (message: string) => string;

  constructor({
    message,
    value,
    disabled,
    selected,
    active,
    selectedPrefix,
    unselectedPrefix,
    inactiveFormatter,
    activeFormatter,
    disabledFormatter,
  }: {
    message: string;
    value: unknown;
    disabled: boolean;
    selected: boolean;
    active: boolean;
    selectedPrefix?: string;
    unselectedPrefix?: string;
    inactiveFormatter?: (message: string) => string;
    activeFormatter?: (message: string) => string;
    disabledFormatter?: (message: string) => string;
  }) {
    this.message = message;
    this.value = value;
    this.disabled = disabled;
    this.selected = selected;
    this.active = active;
    this.inactiveFormatter = inactiveFormatter ?? this.defaultInactiveFormatter;
    this.activeFormatter = activeFormatter ?? this.defaultActiveFormatter;
    this.disabledFormatter = disabledFormatter ?? this.defaultDisabledFormatter;

    if (selectedPrefix) {
      this.selectedPrefix = selectedPrefix;
    }

    if (unselectedPrefix) {
      this.unselectedPrefix = unselectedPrefix;
    }
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
    return `  ${message}`;
  }

  protected defaultActiveFormatter(message: string): string {
    return colors.cyan(`❯ ${message}`);
  }

  protected defaultDisabledFormatter(message: string): string {
    return colors.gray(`- ${message} (disabled)`);
  }

  /**
   * Will build the format string of the item based on its state.
   */
  format(): string {
    if (this.disabled) {
      return this.disabledFormatter(this.fullMessage);
    }

    if (this.active) {
      return this.activeFormatter(this.fullMessage);
    }

    return this.inactiveFormatter(this.fullMessage);
  }
}

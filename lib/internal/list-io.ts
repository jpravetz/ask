import * as colors from '@std/fmt/colors';
import type { Closer, Reader, ReaderSync, Writer, WriterSync } from '@std/io';
import { stripAnsiCodes } from './util.ts';

/**
 * A single choice in a list.
 */
export type Choice = {
  /**
   * The text that will be displayed as the choice in the terminal UI.
   */
  message: string;

  /**
   * The value that will be returned when the choice is selected.
   */
  // deno-lint-ignore no-explicit-any
  value?: any;

  /**
   * Whether the choice is disabled. A disabled choice can never be selected.
   */
  disabled?: boolean;
};

/**
 * A single item in a list.
 */
export class ListItem {
  /**
   * The text that will be displayed as the item in the terminal UI.
   */
  message: string;

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

/**
 * A separator in a list. You can use this to visually separate groups of items
 * in a list. The separator is always disabled and cannot be selected.
 *
 * You can change the message of the separator by passing a string to the
 * constructor. If you don't pass a message, the separator will be a line of
 * 16 dashes.
 */
export class Separator extends ListItem {
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

export async function renderList({
  input,
  output,
  items,

  onEnter,
  onSpace,
  onDown,
  onUp,
  onLeft,
  onRight,
  onNumber,
  columns = 1,
  indent = '',
}: {
  input: Reader & ReaderSync & Closer;
  output: Writer & WriterSync & Closer;
  items: ListItem[];
  columns?: number;

  onEnter: () => void;
  onSpace?: () => void;
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
  onNumber?: (n: number) => void;
  indent?: string;
}): Promise<number> {
  const longestItem = items.reduce((longest, item) => {
    const len = stripAnsiCodes(item.message).length;
    return len > longest ? len : longest;
  }, 0);
  const columnWidth = longestItem + 4; // 4 spaces for padding

  const rows = Math.ceil(items.length / columns);

  for (let i = 0; i < rows; i++) {
    let rowStr = '';
    for (let j = 0; j < columns; j++) {
      const itemIndex = i * columns + j;
      if (itemIndex < items.length) {
        const item = items[itemIndex];
        const formattedItem = item.format();
        const formattedLength = stripAnsiCodes(formattedItem).length;
        const padding = columnWidth - formattedLength;
        rowStr += formattedItem + ' '.repeat(Math.max(0, padding));
      }
    }
    await output.write(new TextEncoder().encode(indent + rowStr + '\n'));
  }

  const data = new Uint8Array(3);
  const n = await input.read(data);

  if (!n) {
    return -1;
  }

  const str = new TextDecoder().decode(data.slice(0, n));

  switch (str) {
    case '\u0003': // ETX
    case '\u0004': // EOT
    case '\u001b': // ESC
      throw new Error('Terminated by user.');

    case '\r': // CR
    case '\n': // LF
      onEnter();
      break;

    case '\u0020': // SPACE
      if (onSpace) {
        onSpace();
      }
      break;

    case '\u001b[A': // UP
      onUp();
      break;

    case '\u001b[B': // DOWN
      onDown();
      break;

    case '\u001b[D': // left
      onLeft();
      break;

    case '\u001b[C': // right
      onRight();
      break;

    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
      if (onNumber) {
        onNumber(parseInt(str, 10));
      }
      break;
  }

  // clear list to rerender it
  for (let i = 0; i < rows; i++) {
    // go to beginning of line
    await output.write(new TextEncoder().encode('\r'));
    // clear line
    await output.write(new TextEncoder().encode('\x1b[K'));
    // go up
    await output.write(new TextEncoder().encode('\x1b[A'));
  }

  return rows;
}

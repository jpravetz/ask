import type * as List from '$list';
import type { KeyBinding } from '$types';
import type * as StdIo from '@std/io';
import type { Writer } from './writer.ts';

/**
 * Defines the options for rendering an interactive list of items.
 */
export type RenderListOpts = {
  /** The input stream to read user key presses from (e.g., `Deno.stdin`). */
  input: StdIo.Reader & StdIo.ReaderSync & StdIo.Closer;
  /** The high-level writer instance to render the list to. */
  output: Writer;
  /** The array of list items to be displayed. */
  items: List.Item[];
  /** The number of columns to arrange the list items in. Defaults to 1. */
  columns?: number;
  /** The string used to indent the entire list. */
  indent?: string;

  /** Callback executed when the `Enter` key is pressed. */
  onEnter: () => void;
  /** Callback executed when the `Space` key is pressed. */
  onSpace?: () => void;
  /** Callback executed when the `Up Arrow` key is pressed. */
  onUp: () => void;
  /** Callback executed when the `Down Arrow` key is pressed. */
  onDown: () => void;
  /** Callback executed when the `Left Arrow` key is pressed. */
  onLeft: () => void;
  /** Callback executed when the `Right Arrow` key is pressed. */
  onRight: () => void;
  /** Callback executed when a number key (1-9) is pressed. */
  onNumber?: (n: number) => void;
  /** Callback executed when the `0` key is pressed. */
  onZero?: () => void;
  /** Callback executed when Ctrl-A is pressed. */
  onSelectAll?: () => void;
  /** Callback executed when Shift+Up is pressed. */
  onShiftUp?: () => void;
  /** Callback executed when Shift+Down is pressed. */
  onShiftDown?: () => void;
  /** Callback executed when Shift+Left is pressed. */
  onShiftLeft?: () => void;
  /** Callback executed when Shift+Right is pressed. */
  onShiftRight?: () => void;
  /** If true, number keypresses will be handled. */
  useNumbers?: boolean;
  /** Key combinations that resolve the prompt with their configured value. */
  keyBindings?: KeyBinding[];
  /** Callback executed when a configured key binding is matched. */
  onKeyBinding?: (value: unknown) => void;
  /** An optional footer line rendered below the list items. */
  footer?: string;
};

/**
 * Defines the options for reading a single line of user input.
 */
export type ReadlineOpts = {
  /** The input stream to read user input from (e.g., `Deno.stdin`). */
  input: StdIo.Reader & StdIo.ReaderSync & StdIo.Closer;
  /** The high-level writer instance for displaying the prompt and user input. */
  output: Writer;
  /** If true, the user's input will not be echoed to the terminal. */
  hidden?: boolean;
  /** A character to use for masking input, commonly used for passwords. */
  mask?: string;
  /** A default value to pre-populate the input line with. */
  defaultValue?: string;
  /**
   * A function that returns the prompt string. This is used to redraw the
   * prompt when needed.
   */
  getPrompt?: () => string;
};

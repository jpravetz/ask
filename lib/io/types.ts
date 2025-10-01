import type * as StdIo from '@std/io';
import type * as Item from '../item/mod.ts';
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
  items: Item.List[];
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
  /** If true, number keypresses will be handled. */
  useNumbers?: boolean;
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
   * Callback function which is called when Ctrl-R is pressed.
   */
  onCtrlR?: () => void | Promise<void>;
  /**
   * A function that returns the prompt string. This is used to redraw the
   * prompt when needed.
   */
  getPrompt?: () => string;
};

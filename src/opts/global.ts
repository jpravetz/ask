import type { Closer, Reader, ReaderSync, Writer, WriterSync } from '@std/io';

/**
 * The visibility of the 'Return to Main Menu' menu item in list prompts.
 * - `'visible'`: enabled and the `0. Return to Main Menu` item is displayed.
 * - `'hidden'`: enabled but the item is not displayed. Pressing `0` still
 *   triggers the feature.
 * - `'off'`: disabled. Pressing `0` has no effect.
 */
export type ReturnToMainMenuOpt = 'off' | 'hidden' | 'visible';

/**
 * The global options that can be passed to an `Ask` instance.
 */
export type GlobalPromptOpts = {
  /**
   * The prefix that will be displayed before the prompt message. Can be
   * overridden by specifying the `prefix` option in a specific question.
   */
  prefix?: string;

  /**
   * The suffix that will be displayed after the prompt message. Can be
   * overridden by specifying the `suffix` option in a specific question.
   */
  suffix?: string;

  /**
   * The string that will be used to indent the prompt. Can be overridden by
   * specifying the `indent` option in a specific question.
   */
  indent?: string | number;

  /**
   * The reader interface that will be used to read user input. Please note that
   * certain prompt types (such as `password`) only work with `Deno.stdin`.
   */
  input?: Reader & ReaderSync & Closer;

  /**
   * The writer interface that will be used to write output to the user.
   */
  output?: Writer & WriterSync & Closer;

  /**
   * The number of blank lines to display before the prompt. Defaults to 1.
   */
  preNewLine?: number;
  /**
   * Callback function which is called when Ctrl-R is pressed. If it returns a
   * boolean, the spinner will change to a green or red circle to indicate
   * success or failure.
   */
  onCtrlR?: () => boolean | void | Promise<boolean | void>;

  /**
   * Controls the 'Return to Main Menu' feature for list prompts (`select` and
   * `checkbox`). When enabled, pressing `0` in a list prompt causes the prompt
   * to throw a `ReturnToMainMenuError`, which the application can catch to
   * navigate back to its main menu. Defaults to `'off'`.
   */
  returnToMainMenu?: ReturnToMainMenuOpt;

  /**
   * The label of the 'Return to Main Menu' menu item. Defaults to
   * `'Return to Main Menu'`.
   */
  returnToMainMenuLabel?: string;
};

import type { Closer, Reader, ReaderSync, Writer, WriterSync } from '@std/io';

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
};

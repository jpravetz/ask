import type { PromptOpts } from './prompt.ts';

/**
 * The options for a confirm (yes/no) prompt.
 */
export type ConfirmOpts = PromptOpts<boolean> & {
  /**
   * The type of the prompt. This can not be changed but will be used to
   * determine the type of the question.
   */
  type?: 'confirm';

  /**
   * The characters to accept as a positive answer. The first character is displayed in the prompt.
   * Defaults to "yY1tT"
   */
  accept?: string;

  /** The string to display for a positive answer. Defaults to 'Yes' */
  acceptDisplay?: string;

  /**
   * The characters to accept as a negative answer. The first character is displayed in the prompt.
   * Defaults to "nN0fF"
   */
  deny?: string;

  /** The string to display for a negative answer. Defaults to 'No' */
  denyDisplay?: string;
};

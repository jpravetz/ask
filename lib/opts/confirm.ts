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
   * The text to display and accept as a positive answer. Defaults to "y".
   */
  accept?: string;

  /**
   * The text to display and accept as a negative answer. Defaults to "n". In
   * practice, anything other than `accept` will be considered a negative
   * response, so this is mostly for display purposes.
   */
  deny?: string;
};

import type { PromptOpts } from './prompt.ts';

/**
 * Options for the password prompt.
 */
export type PasswordOpts = PromptOpts<string> & {
  /**
   * The type of the prompt. This can not be changed but will be used to
   * determine the type of the question.
   */
  type?: 'password';

  /**
   * An optional mask character to hide the input. If true, "•" is used. If not provided, the input
   * will be hidden entirely. Only the first character of the mask will be used.
   */
  mask?: string | boolean;
};

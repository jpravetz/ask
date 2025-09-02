import type { PromptOpts } from './prompt.ts';

/**
 * Options for the input prompt.
 */
export type InputOpts = PromptOpts<string> & {
  /**
   * The type of the prompt. This can not be changed but will be used to
   * determine the type of the question.
   */
  type?: 'input';
};

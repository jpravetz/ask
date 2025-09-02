import type { NumberType } from '$types';
import type { PromptOpts } from './prompt.ts';

/**
 * Options for the number prompt.
 */
export type NumberOpts = PromptOpts<number> & {
  /**
   * The type of the prompt. This can not be changed but will be used to
   * determine the type of the question.
   */
  type?: 'number';

  /**
   * The minimum value that can be entered. Defaults to negative infinity.
   */
  min?: number;

  /**
   * The maximum value that can be entered. Defaults to positive infinity.
   */
  max?: number;

  /**
   * The type of number that can be entered. This will determine if the input
   * will be parsed as an integer or as a float. Defaults to "integer".
   */
  numberType?: NumberType;
};

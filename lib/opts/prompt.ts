import type * as Prompts from '$prompt';
import type { GlobalPromptOpts } from './global.ts';

/**
 * The common options that can be passed to a single prompt question.
 */
export type PromptOpts<RetType> = {
  /**
   * The name (identifier) of the question. This will be used as the key of the
   * returned answer object.
   */
  name: string;

  /**
   * The type of the prompt. This determines the behavior and the return type of
   * the question's value.
   */
  type?: Prompts.Type;

  /**
   * The message that will be displayed to the user. If not provided, the `name`
   * will be used instead.
   */
  message?: string;

  /**
   * The default value of the prompt. If the user does not provide an answer,
   * this value will be used.
   */
  default?: RetType;

  /**
   * A validation function that checks if the provided value is valid. `Ask`
   * will keep asking the question until the validation function returns `true`.
   * @param val The value that the user provided.
   * @returns `true` if the value is valid, `false` otherwise.
   */
  validate?: <U extends RetType>(val?: U) => boolean | Promise<boolean>;

  /**
   * The maximum number of times the program will ask the user for input if it
   * doesn't pass validation. After this number is exceeded, the program will
   * call the `onExceededAttempts` function.
   */
  maxAttempts?: number;

  /**
   * The function that will be called when the maximum number of attempts is
   * exceeded.
   * @param lastInput The last invalid input of the user.
   */
  onExceededAttempts?: <U extends RetType>(
    lastInput?: U,
    retryFn?: () => Promise<U | undefined>,
  ) => void | Promise<void>;

} & GlobalPromptOpts;

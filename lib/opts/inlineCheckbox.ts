import type { Choice } from '$types';
import type { PromptOpts } from './prompt.ts';

/**
 * Options for the inline checkbox prompt.
 */
export type InlineCheckboxOpts = PromptOpts<unknown[]> & {
  /**
   * The type of the prompt. This can not be changed but will be used to
   * determine the type of the question.
   */
  type?: 'inline-checkbox';

  /**
   * A list of choices for the user to select multiple values from.
   */
  choices: Choice[];

  /**
   * A string to be displayed after the choices.
   */
  suffix?: string;

  selectedPrefix?: string;

  unselectedPrefix?: string;

  finalSelectedPrefix?: string;

  finalUnselectedPrefix?: string;

  /**
   * A function that can override the way an unchecked choice is displayed. It
   * receives the `message` field of the `Choice` object as a parameter.
   * @param message The message of the choice.
   */
  inactiveFormatter?: (message: string) => string;

  /**
   * A function that can override the way a checked choice is displayed. It
   * receives the `message` field of the `Choice` object as a parameter.
   * @param message The message of the choice.
   */
  activeFormatter?: (message: string) => string;

  /**
   * A function that can override the way a disabled choice is displayed. It
   * receives the `message` field of the `Choice` object as a parameter.
   * @param message The message of the choice.
   */
  disabledFormatter?: (message: string) => string;
};

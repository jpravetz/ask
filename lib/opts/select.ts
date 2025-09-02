import type { Choice } from '$types';
import type { PromptOpts } from './prompt.ts';

/**
 * Options for the select prompt.
 */
export type SelectOpts = PromptOpts<unknown> & {
  /**
   * The type of the prompt. This can not be changed but will be used to
   * determine the type of the question.
   */
  type?: 'select';

  /**
   * A list of choices for the user to select from.
   */
  choices: Choice[];

  /**
   * A function that can override the way an inactive (non-selected) choice is
   * displayed. It receives the `message` field of the `Choice` object as a
   * parameter.
   * @param message The message of the choice.
   */
  inactiveFormatter?: (message: string) => string;

  /**
   * A function that can override the way an active (selected) choice is
   * displayed. It receives the `message` field of the `Choice` object as a
   * parameter.
   * @param message The message of the choice.
   */
  activeFormatter?: (message: string) => string;

  /**
   * A function that can override the way a disabled choice is displayed. It
   * receives the `message` field of the `Choice` object as a parameter.
   * @param message The message of the choice.
   */
  disabledFormatter?: (message: string) => string;

  /**
   * If true, a number will be shown in front of each choice. If the user
   * enters that number, the choice will be selected.
   */
  useNumbers?: boolean;

  /**
   * The number of columns to display.
   */
  columns?: number;
};

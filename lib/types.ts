import type * as Opts from '$opts';

/**
 * A single choice in a list.
 */
export type Choice = {
  /**
   * The text that will be displayed as the choice in the terminal UI.
   */
  message: string;

  /**
   * The value that will be returned when the choice is selected.
   */
  value?: unknown;

  /**
   * Whether the choice is disabled or not.
   */
  disabled?: boolean;
};

/**
 * The type of number that can be entered. This will determine if the input will
 * be parsed as an integer or as a float.
 */
export type NumberType = 'integer' | 'float';

/**
 * The result of a prompt.
 */
export type Result<O extends Opts.Prompt<T>, T> = {
  [K in O['name']]: T;
};

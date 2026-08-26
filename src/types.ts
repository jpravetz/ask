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
 * A key combination that, when pressed in a list prompt, resolves the prompt
 * with the configured `value` as if the user had selected a matching choice.
 * Key bindings are matched before built-in keys, so they can override defaults.
 */
export type KeyBinding = {
  /**
   * The single character of the binding. For `ctrl` this should be a lowercase
   * letter (e.g. `'r'` for Ctrl-R). For `alt` it should be a single character.
   */
  key: string;

  /**
   * The modifier key. Defaults to `'ctrl'`.
   */
  modifier?: 'ctrl' | 'alt';

  /**
   * The value the prompt resolves to when the binding is activated.
   */
  value?: unknown;
};

/**
 * The result of a prompt.
 */
export type Result<O extends Opts.Prompt<T>, T> = {
  [K in O['name']]: T;
};

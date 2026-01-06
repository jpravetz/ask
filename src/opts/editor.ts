import type { PromptOpts } from './prompt.ts';

/**
 * Options for the editor prompt.
 */
export type EditorOpts = PromptOpts<string> & {
  /**
   * The type of the prompt. This can not be changed but will be used to
   * determine the type of the question.
   */
  type?: 'editor';

  /**
   * A path override or executable name for the editor to use. If not provided,
   * the `VISUAL` or `EDITOR` environment variables will be used, and if those
   * aren't present either, a series of common editors will be searched for in
   * the system `PATH`.
   */
  editorPath?: string;

  /**
   * A custom message to tell the user to press enter to launch their preferred
   * editor. If not provided, a default message will be used.
   */
  editorPromptMessage?: string;
};

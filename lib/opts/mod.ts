import type { PromptOpts } from './prompt.ts';

export type { CheckboxOpts as Checkbox } from './checkbox.ts';
export type { ConfirmOpts as Confirm } from './confirm.ts';
export type { EditorOpts as Editor } from './editor.ts';
export type { GlobalPromptOpts as GlobalPrompt } from './global.ts';
export type { InputOpts as Input } from './input.ts';
export type { ListOpts as List } from './list.ts';
export type { NumberOpts as Number } from './number.ts';
export type { PasswordOpts as Password } from './password.ts';
export type { SelectOpts as Select } from './select.ts';
export type { PromptOpts as Prompt };

/**
 * Common options for text prompts.
 */
export type Text<T = string> = {
  hidden?: boolean;
  mask?: string;
} & PromptOpts<T>;

/**
 * @module
 * `ask` is a slick Deno module that allows you to create interactive
 * command-line applications. It provides a simple and intuitive API for
 * creating prompts and validating user input.
 */

export * from './lib/ask.ts';

export * from './lib/core/result.ts';
export * from './lib/prompt/base.ts';
export * from './lib/prompt/list.ts';
export * from './lib/prompt/text.ts';

export * from './lib/prompt/checkbox.ts';
export * from './lib/prompt/confirm.ts';
export * from './lib/prompt/editor.ts';
export * from './lib/prompt/input.ts';
export * from './lib/prompt/number.ts';
export * from './lib/prompt/password.ts';
export * from './lib/prompt/select.ts';

/**
 * @module
 * `ask` is a slick Deno module that allows you to create interactive
 * command-line applications. It provides a simple and intuitive API for
 * creating prompts and validating user input.
 */

export * as Io from '$io';
export * as Item from '$item';
export * as Opts from '$opts';
export * as Prompt from '$prompt';
export { Ask as Main } from './lib/ask.ts';
export type * from './lib/types.ts';

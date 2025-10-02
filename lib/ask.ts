import type * as Opts from '$opts';
import * as Prompt from '$prompt';
import type { Result } from '$types';
import { EndOfFileError, UserAbortedError } from './errors.ts';

// import { type Opts.Input, Prompt.Input } from './handlers/input.ts';
// import { type Opts.Number, Prompt.Number } from './handlers/number.ts';
// import { type Opts.Confirm, Prompt.Confirm } from './handlers/confirm.ts';
// import { type Opts.Password, Prompt.Password } from './handlers/password.ts';
// import { type Opts.Editor, Prompt.Editor } from './handlers/editor.ts';
// import { type Opts.Select, Prompt.Select } from './handlers/select.ts';
// import { type Opts.Checkbox, Prompt.Checkbox } from './handlers/checkbox.ts';

type SupportedOpts =
  | Opts.Input
  | Opts.Number
  | Opts.Confirm
  | Opts.Password
  | Opts.Editor
  | Opts.Select
  | Opts.Checkbox
  | Opts.InlineCheckbox;

type PromptResult<O extends SupportedOpts> = O['type'] extends 'input'
  ? Result<O extends Opts.Input ? O : never, string | undefined>
  : O['type'] extends 'number' ? Result<O extends Opts.Number ? O : never, number | undefined>
  : O['type'] extends 'confirm' ? Result<O extends Opts.Confirm ? O : never, boolean | undefined>
  : O['type'] extends 'password' ? Result<O extends Opts.Password ? O : never, string | undefined>
  : O['type'] extends 'editor' ? Result<O extends Opts.Editor ? O : never, string | undefined>
  : O['type'] extends 'select' ? Result<O extends Opts.Select ? O : never, unknown | undefined>
  : O['type'] extends 'checkbox' ? Result<O extends Opts.Checkbox ? O : never, unknown[] | undefined>
  : O['type'] extends 'inlineCheckbox'
    ? Result<O extends Opts.InlineCheckbox ? O : never, unknown[] | undefined>
  : never;

type PromptResultMap<T extends Array<SupportedOpts>> = {
  [K in T[number] as K['name']]: PromptResult<K> extends infer R
    ? R extends Record<string, unknown> ? R[K['name']]
    : never
    : never;
};

/**
 * @class
 * Ask is a class that contains methods which allow you to create command-line
 * prompts easily.
 */
export class Ask {
  readonly opts: Opts.GlobalPrompt;

  /**
   * @constructor
   * Creates an `ask` instance. You can pass global options to it to customize
   * behavior across all questions that will be asked through this instance.
   * @param opts
   */
  constructor(opts?: Opts.GlobalPrompt) {
    this.opts = opts ?? {};
  }

  private mergeOptions<T>(opts: Omit<SupportedOpts, 'type'>): T {
    return { ...this.opts, ...opts } as T;
  }

  /**
   * Will ask for a string input and will return an object with a single
   * property where the key is the name of the input and the value is a string
   * containing the user's input (can be undefined).
   * @param opts
   * @example
   * ```ts
   * import { Ask } from "@jpravetz/ask";
   *
   * const ask = new Ask();
   *
   * const { name } = await ask.input({
   *   name: "name",
   *   message: "What is your name?",
   * } as const);
   *
   * console.log(name);
   */
  async input<T extends Opts.Input>(
    opts: T,
  ): Promise<Result<T, string | undefined> | undefined> {
    const answers = await this.prompt([{ ...opts, type: 'input' }]);
    return answers as Result<T, string | undefined> | undefined;
  }

  /**
   * Will ask for a number input and will return an object with a single
   * property where the key is the name of the input and the value is a number
   * containing the user's input (can be undefined). You can also specify a
   * maximum and a minimum value, which will affect the way the prompt message
   * is displayed and will also validate the user's input.
   * @param opts
   * @example
   * ```ts
   * import { Ask } from "@jpravetz/ask";
   *
   * const ask = new Ask();
   *
   * const { age } = await ask.number({
   *   name: "age",
   *   message: "What is your age?",
   *   min: 16,
   *   max: 100,
   * } as const);
   *
   * console.log(age);
   */
  async number<T extends Opts.Number>(
    opts: T,
  ): Promise<Result<T, number | undefined> | undefined> {
    const answers = await this.prompt([{ ...opts, type: 'number' }]);
    return answers as Result<T, number | undefined> | undefined;
  }

  /**
   * Will ask a yes/no question and return an object with a single property
   * where the key is the name of the input and the value is a boolean depending
   * on the provided answer. You can override the string that will be used for
   * the confirmation and denial of the question. The default values are "y" and
   * "n" respectively. The prompt message will be displayed with the provided
   * values in square brackets.
   * @param opts
   * @example
   * ```ts
   * import { Ask } from "@jpravetz/ask";
   *
   * const ask = new Ask();
   *
   * const { canDrive } = await ask.confirm({
   *   name: "canDrive",
   *   message: "Can you drive?",
   * } as const);
   *
   * console.log(canDrive);
   */
  async confirm<T extends Opts.Confirm>(
    opts: T,
  ): Promise<Result<T, boolean | undefined> | undefined> {
    const answers = await this.prompt([{ ...opts, type: 'confirm' }]);
    return answers as Result<T, boolean | undefined> | undefined;
  }

  /**
   * Will ask for a password input and will return an object with a single
   * property where the key is the name of the input and the value is a string
   * containing the user's input (can be undefined). The input will be hidden
   * by default (meaning there will be no feedback when typing the answer), but
   * you can override this behavior by specifying a mask character (such as an
   * asterisk).
   * @param opts
   * @example
   * ```ts
   * import { Ask } from "@jpravetz/ask";
   *
   * const ask = new Ask();
   *
   * const { password } = await ask.password({
   *   name: "password",
   *   message: "Enter your password:",
   *   mask: "*",
   * } as const);
   *
   * console.log(password);
   */
  async password<T extends Opts.Password>(
    opts: T,
  ): Promise<Result<T, string | undefined> | undefined> {
    const answers = await this.prompt([{ ...opts, type: 'password' }]);
    return answers as Result<T, string | undefined> | undefined;
  }

  /**
   * Will open a temporary file in the user's preferred editor and will return
   * the contents of the file when the editor is closed. You can specify a path
   * override or an executable name for the editor to use. If not provided, the
   * `VISUAL` or `EDITOR` environment variables will be used, and if those
   * aren't present either, a series of common editors will be searched for in
   * the system `PATH`. You can also provide a custom message to tell the user
   * to press enter to launch their preferred editor.
   * @param opts
   * @example
   * ```ts
   * import { Ask } from "@jpravetz/ask";
   *
   * const ask = new Ask();
   *
   * const { content } = await ask.editor({
   *   name: "bio",
   *   message: "Write a short bio about yourself:",
   *   editorPath: "nano",
   *   editorPromptMessage: "Press enter to open the nano editor",
   * } as const);
   *
   * console.log(content);
   */
  async editor<T extends Opts.Editor>(
    opts: T,
  ): Promise<Result<T, string | undefined> | undefined> {
    const answers = await this.prompt([{ ...opts, type: 'editor' }]);
    return answers as Result<T, string | undefined> | undefined;
  }

  /**
   * Will display a list of choices to the user. The user can select one of the
   * choices by using the `up` and `down` arrow keys. The user can confirm their
   * selection by pressing the `enter` key. The selected choice will be returned
   * as an object. You can also provide a function that can override the way the
   * choices are displayed based on their status (active, inactive, disabled).
   * You can also use the `Separator` class to add a separator between choices.
   * @param opts
   * @example
   * ```ts
   * import { Ask, Separator } from "@jpravetz/ask";
   *
   * const ask = new Ask();
   *
   * const { topping } = await ask.select({
   *   name: "topping",
   *   message: "Select a pizza topping:",
   *   choices: [
   *     { message: "Pepperoni", value: "pepperoni" },
   *     { message: "Mushrooms", value: "mushrooms" },
   *     new Separator(),
   *     { message: "Pineapple", value: "pineapple" },
   *  ],
   * } as const);
   *
   * console.log(topping);
   * ```
   */
  async select<T extends Opts.Select>(
    opts: T,
  ): Promise<Result<T, unknown> | undefined> {
    const answers = await this.prompt([{ ...opts, type: 'select' }]);
    return answers as Result<T, unknown> | undefined;
  }

  /**
   * Will display a list of choices to the user. The user can select several of
   * choices by using the `up` and `down` arrow keys. The user can mark an
   * option as selected by pressing the `space` key and can finalize their
   * selections using the `enter` key. The selected choices will be returned as
   * as an object. You can also provide a function that can override the way the
   * choices are displayed based on their status (active, inactive, disabled),
   * as well as prefixes for selected and unselected choices. You can also use
   * the `Separator` class to add a separator between choices.
   * @param opts
   * @example
   * ```ts
   * import { Ask, Separator } from "@jpravetz/ask";
   *
   * const ask = new Ask();
   *
   * const { toppings } = await ask.checkbox({
   *   name: "toppings",
   *   message: "Select pizza toppings:",
   *   choices: [
   *     { message: "Pepperoni", value: "pepperoni" },
   *     { message: "Mushrooms", value: "mushrooms" },
   *     new Separator(),
   *     { message: "Pineapple", value: "pineapple" },
   *   ],
   * } as const);
   *
   * console.log(toppings);
   * ```
   */
  async checkbox<T extends Opts.Checkbox>(
    opts: T,
  ): Promise<Result<T, unknown[]> | undefined> {
    const answers = await this.prompt([{ ...opts, type: 'checkbox' }]);
    return answers as Result<T, unknown[]> | undefined;
  }

  async inlineCheckbox<T extends Opts.InlineCheckbox>(
    opts: T,
  ): Promise<Result<T, unknown[]> | undefined> {
    const answers = await this.prompt([{ ...opts, type: 'inlineCheckbox' }]);
    return answers as Result<T, unknown[]> | undefined;
  }

  private async runPrompt<T extends SupportedOpts>(
    question: T,
  ): Promise<PromptResult<T> | undefined> {
    switch (question.type) {
      case 'input': {
        return (await new Prompt.Input(this.mergeOptions<Opts.Input>(question)).run()) as PromptResult<T>;
      }
      case 'number': {
        return (await new Prompt.Number(this.mergeOptions<Opts.Number>(question)).run()) as PromptResult<T>;
      }
      case 'confirm': {
        return (await new Prompt.Confirm(this.mergeOptions<Opts.Confirm>(question)).run()) as PromptResult<
          T
        >;
      }
      case 'password': {
        return (await new Prompt.Password(this.mergeOptions<Opts.Password>(question)).run()) as PromptResult<
          T
        >;
      }
      case 'editor': {
        return (await new Prompt.Editor(this.mergeOptions<Opts.Editor>(question)).run()) as PromptResult<T>;
      }
      case 'select': {
        return (await new Prompt.Select(this.mergeOptions<Opts.Select>(question)).run()) as PromptResult<T>;
      }
      case 'checkbox': {
        return (await new Prompt.Checkbox(this.mergeOptions<Opts.Checkbox>(question)).run()) as PromptResult<
          T
        >;
      }
      case 'inlineCheckbox': {
        return (
          (await new Prompt.InlineCheckbox(
            this.mergeOptions<Opts.InlineCheckbox>(question),
          ).run()) as PromptResult<T>
        );
      }
    }
  }

  /**
   * Will ask a series of questions based on an array of prompt options and
   * return a type-safe object where each key is the name of a question and the
   * value is the user's input for that question (the type of the value will be
   * inferred based on the type of the question).
   * **For most use cases, it's recommended to use the individual methods.**
   * @param questions
   * @example
   * ```ts
   * import { Ask } from "@jpravetz/ask";
   *
   * const ask = new Ask();
   *
   * const answers = await ask.prompt([
   *   {
   *     type: "input",
   *     name: "name",
   *     message: "What is your name?",
   *   },
   *   {
   *     type: "number",
   *     name: "age",
   *     message: "What is your age?",
   *     min: 16,
   *     max: 100,
   *   },
   *   {
   *    type: "confirm",
   *    name: "canDrive",
   *    message: "Can you drive?",
   *   },
   * ] as const);
   *
   * console.log(answers.name); // will be a string
   * console.log(answers.age); // will be a number
   * console.log(answers.canDrive); // will be a boolean
   */ async prompt<T extends Array<SupportedOpts>>(
    questions: T,
  ): Promise<PromptResultMap<T> | undefined> {
    const answers: Record<string, unknown> = {};

    for (let i = 0; i < questions.length; ++i) {
      const question = questions[i];
      let answer: Result<SupportedOpts, unknown> | undefined;

      while (true) {
        try {
          answer = await this.runPrompt(question);
          break; // Break the while loop if the prompt is successful
        } catch (error) {
          if (error instanceof EndOfFileError) {
            try {
              const { exit } = (await new Prompt.Confirm(
                this.mergeOptions<Opts.Confirm>({
                  name: 'exit',
                  message: 'You pressed Ctrl-D. Do you want to exit?',
                  default: true,
                }),
              ).run()) as { exit: boolean };

              if (exit) {
                throw new UserAbortedError(); // Exit the entire prompt series
              }
            } catch (innerError) {
              if (innerError instanceof EndOfFileError || innerError instanceof UserAbortedError) {
                // If user Ctrl-D's or ESC's on the exit confirmation,
                // treat it as an exit.
                throw new UserAbortedError();
              }
              throw innerError; // Re-throw other unexpected errors
            }
          } else {
            throw error; // Re-throw other errors
          }
        }
      }

      if (typeof answer === 'undefined') {
        return undefined;
      }
      Object.assign(answers, answer);
    }

    return answers as PromptResultMap<T>;
  }
}

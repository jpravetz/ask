import { InterruptedError } from '$errors';
import { Fmt } from '$fmt';
import type * as Opts from '$opts';
import type { Result } from '$types';
import { TextPrompt } from './text.ts';

/**
 * A prompt for a password input.
 */
export class PasswordPrompt<T extends Opts.Password> extends TextPrompt {
  constructor(opts: T) {
    super({
      ...opts,
      hidden: !opts.mask,
      mask: opts.mask?.charAt(0),
    });
    this.type = 'password';
  }

  /**
   * Asks the user for a password input and returns the result as an object.
   */
  async run(): Promise<Result<T, string | undefined> | undefined> {
    try {
      const answer = await this.askUntilValid();

      if (answer === undefined) {
        return undefined;
      }

      await this.output.clearPromptLine();
      const finalPrompt = `${this.getPrompt(true)}${Fmt.answer('')}`;
      await this.output.redraw(finalPrompt);

      const result = {
        [this.name]: answer,
      } as Result<T, string | undefined>;

      return result;
    } catch (err) {
      if (err instanceof InterruptedError) {
        return undefined;
      }
      throw err;
    }
  }
}

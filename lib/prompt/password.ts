import { InterruptedError } from '../errors.ts';
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

      await this.output.write(new TextEncoder().encode('\r\x1b[K'));
      const finalPrompt = `${this.getPrompt().substring(1)}`;
      await this.output.write(new TextEncoder().encode(finalPrompt));
      await this.output.write(new TextEncoder().encode('\n'));

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

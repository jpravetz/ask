import { InterruptedError } from '../errors.ts';
import type { Result } from '$types';
import { TextPrompt } from './text.ts';
import type * as Opts from '$opts';

/**
 * A prompt for a simple text input.
 */
export class InputPrompt<T extends Opts.Input> extends TextPrompt {
  constructor(opts: T) {
    super(opts);
    this.type = 'input';
  }

  /**
   * Asks the user for a text input and returns the result as an object.
   */
  async run(): Promise<Result<T, string | undefined> | undefined> {
    try {
      const answer = await this.askUntilValid();

      await this.output.write(new TextEncoder().encode('\r\x1b[K'));
      const finalPrompt = `${this.getPrompt()}: ${answer}`;
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

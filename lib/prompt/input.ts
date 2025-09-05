import { Fmt } from '$fmt';
import type * as Opts from '$opts';
import type { Result } from '$types';
import { InterruptedError } from '../errors.ts';
import { TextPrompt } from './text.ts';

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

      const finalPrompt = `${this.getPrompt(true)}${Fmt.answer(answer ?? '')}`;
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

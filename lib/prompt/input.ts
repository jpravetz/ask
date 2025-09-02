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
  async run(): Promise<Result<T, string | undefined>> {
    const answer = await this.askUntilValid();

    const finalPrompt = `${this.getPrompt()}: ${answer}`;
    await this.redraw(finalPrompt);

    const result = {
      [this.name]: answer,
    } as Result<T, string | undefined>;

    return result;
  }
}

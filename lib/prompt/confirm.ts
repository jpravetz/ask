import type * as Opts from '$opts';
import type { Result } from '$types';
import { readLine } from '$io';
import { TextPrompt } from './text.ts';

/**
 * A confirm (yes/no) prompt.
 */
export class ConfirmPrompt<T extends Opts.Confirm> extends TextPrompt<boolean> {
  private accept: string;
  private deny: string;

  constructor(opts: T) {
    super(opts);
    this.type = 'confirm';

    this.accept = opts.accept ?? 'y';
    this.deny = opts.deny ?? 'n';

    const defaultIsTrue = this.default ?? true;
    const y = defaultIsTrue ? this.accept.toUpperCase() : this.accept;
    const n = !defaultIsTrue ? this.deny.toUpperCase() : this.deny;

    this.message = `${this.message} [${y}/${n}]`;
  }

  /**
   * Asks the user for a confirmation and returns the result as an object.
   */
  async run(): Promise<Result<T, boolean | undefined>> {
    const answer = await this.askUntilValid((val) => {
      if (typeof val === 'undefined') {
        // ESC
        return false;
      }
      if (val === '') {
        // RETURN
        return this.default ?? true;
      }

      val = val.toLowerCase();
      return val === this.accept.toLowerCase();
    });

    const finalPrompt = `${this.getPrompt()}: ${answer ? 'Yes' : 'No'}`;
    await this.redraw(finalPrompt);

    const result = {
      [this.name]: answer,
    } as Result<T, boolean | undefined>;

    return result;
  }

  protected override async question(): Promise<string | undefined> {
    const prompt = new TextEncoder().encode(this.getPrompt());
    await this.output.write(prompt);

    const input = await readLine({
      input: this.input,
      output: this.output,
    });

    return input;
  }
}
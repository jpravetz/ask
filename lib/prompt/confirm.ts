import { Fmt } from '$fmt';
import { readLine } from '$io';
import type * as Opts from '$opts';
import type { Result } from '$types';
import { InterruptedError } from '../errors.ts';
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
  async run(): Promise<Result<T, boolean | undefined> | undefined> {
    try {
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

      const finalPrompt = `${this.getPrompt(true)}${answer ? Fmt.yes : Fmt.no}`;
      await this.output.clearLine();
      await this.output.redraw(finalPrompt);

      const result = {
        [this.name]: answer,
      } as Result<T, boolean | undefined>;

      return result;
    } catch (err) {
      if (err instanceof InterruptedError) {
        return undefined;
      }
      throw err;
    }
  }

  protected override async question(): Promise<string | undefined> {
    await this.start();
    await this.output.write(this.getPrompt());

    const input = await readLine({
      input: this.input,
      output: this.output,
    });

    return input;
  }
}

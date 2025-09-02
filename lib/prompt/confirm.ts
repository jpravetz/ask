import type * as Opts from '$opts';
import type { Result } from '$types';
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

    this.message = `${this.message} [${this.accept}/${this.deny}]`;
  }

  /**
   * Asks the user for a confirmation and returns the result as an object.
   */
  async run(): Promise<Result<T, boolean | undefined>> {
    const answer = await this.askUntilValid((val) => {
      if (typeof val === 'undefined') {
        return this.default ?? false;
      }
      if (val === '') {
        return this.default ?? true;
      }

      val = val.toLowerCase();
      return val === this.accept;
    });

    const result = {
      [this.name]: answer,
    } as Result<T, boolean | undefined>;

    return result;
  }
}

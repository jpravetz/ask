import type * as Opts from '$opts';
import type { Result } from '$types';
import { ListPrompt } from './list.ts';

/**
 * A prompt for a select list which allows users to select one of the provided
 * choices.
 */
export class SelectPrompt<T extends Opts.Select> extends ListPrompt {
  constructor(opts: Opts.Select) {
    super({
      ...opts,
      multiple: false,
      useNumbers: opts.useNumbers ?? false,
      columns: opts.columns ?? 1,
      selectedPrefix: '',
      unselectedPrefix: '',
    });
    this.type = 'select';
  }

  /**
   * Displays a list of choices to the user. The user can select one of the
   * choices by using the `up` and `down` arrow keys. The user can confirm their
   * selection by pressing the `enter` key. The selected choice will be returned
   * as an object.
   */
  async run(): Promise<Result<T, unknown> | undefined> {
    const answer = await this.questionSingle();

    if (answer === undefined) {
      return undefined;
    }

    const result = {
      [this.name]: answer,
    } as Result<T, unknown>;

    return result;
  }
}

import { Fmt } from '$fmt';
import type * as Opts from '$opts';
import type { Result } from '$types';
import { ListPrompt } from './list.ts';

/**
 * A prompt for a checkbox list which allows users to select multiple values
 * from the provided choices.
 */
export class CheckboxPrompt<T extends Opts.Checkbox> extends ListPrompt {
  constructor(opts: Opts.Checkbox) {
    super({
      ...opts,
      multiple: true,
      selectedPrefix: opts.selectedPrefix ?? Fmt.checkbox.prefix.selected,
      unselectedPrefix: opts.unselectedPrefix ?? Fmt.checkbox.prefix.unselected,
    });
    this.type = 'checkbox';
  }

  async run(): Promise<Result<T, unknown[]> | undefined> {
    const answer = await this.questionMultiple();

    if (answer === undefined) {
      return undefined;
    }

    const result = {
      [this.name]: answer,
    } as Result<T, unknown[]>;

    return result;
  }
}

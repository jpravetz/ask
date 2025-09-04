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
      selectedPrefix: opts.selectedPrefix ?? Fmt.checkbox.selected,
      unselectedPrefix: opts.unselectedPrefix ?? Fmt.checkbox.unselected,
    });
    this.type = 'checkbox';
  }

  async run(): Promise<Result<T, unknown[]>> {
    const answer = await this.questionMultiple();

    const result = {
      [this.name]: answer,
    } as Result<T, unknown[]>;

    return result;
  }
}


import type * as Opts from '$opts';
import type { Result } from '$types';
import * as colors from '@std/fmt/colors';
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
      selectedPrefix: opts.selectedPrefix ?? colors.cyan('● '),
      unselectedPrefix: opts.unselectedPrefix ?? '○ ',
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

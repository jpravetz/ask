import type * as Opts from '$opts';
import type { NumberType, Result } from '$types';
import { TextPrompt } from './text.ts';

/**
 * A prompt for a number input.
 */
export class NumberPrompt<T extends Opts.Number> extends TextPrompt<number> {
  private min: number;
  private max: number;
  private numberType: NumberType;

  constructor(opts: T) {
    super(opts);
    this.type = 'number';

    this.min = opts.min === void 1 ? -Infinity : opts.min;
    this.max = opts.max === void 1 ? Infinity : opts.max;
    this.numberType = opts.numberType ?? 'integer';

    this.message = this.messageWithRange;

    this.validate = async (val) => {
      const withinRange = this.isWithinRange(val);
      const validInput = typeof opts.validate !== 'undefined' ? await opts.validate(val) : true;

      return withinRange && validInput;
    };
  }

  get messageWithRange(): string {
    if (this.min === -Infinity && this.max === Infinity) {
      return this.message;
    }

    if (this.min !== -Infinity && this.max === Infinity) {
      return `${this.message} (>= ${this.min})`;
    }

    if (this.min === -Infinity && this.max !== Infinity) {
      return `${this.message} (<= ${this.max})`;
    }

    return `${this.message} (${this.min}-${this.max})`;
  }

  private isWithinRange(val: number | undefined): boolean {
    if (typeof val === 'undefined') {
      return false;
    }

    return val >= this.min && val <= this.max;
  }

  /**
   * Asks the user for a number input and returns the result as an object.
   */
  async run(): Promise<Result<T, number | undefined>> {
    const answer = await this.askUntilValid((val) => {
      switch (this.numberType) {
        case 'integer':
          return parseInt(val ?? '', 10);
        case 'float':
          return parseFloat(val ?? '');
      }
    });

    const result = {
      [this.name]: answer,
    } as Result<T, number | undefined>;

    return result;
  }
}

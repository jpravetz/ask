import { readLine } from '$io';
import type * as Opts from '$opts';
import * as colors from '@std/fmt/colors';
import { EndOfFileError, InterruptedError } from '../errors.ts';
import { Prompt } from './base.ts';

/**
 * A text prompt.
 */
export class TextPrompt<T = string> extends Prompt<T> {
  private hidden?: boolean;
  private mask?: string;

  private _attempts: number = 0;

  constructor(opts: Opts.Text<T>) {
    super(opts);
    this.hidden = opts.hidden;
    this.mask = opts.mask;
  }

  protected async printError(message: string) {
    await this.output.write(`${colors.red('>>')} ${message}\n`);
  }

  protected printErrorSync(message: string) {
    this.output.writeSync(`${colors.red('>>')} ${message}\n`);
  }

  protected async question(): Promise<string | undefined> {
    const prompt = new TextEncoder().encode(this.getPrompt());

    await this.output.write(prompt);

    const input = await readLine({
      input: this.input,
      output: this.output,
      mask: this.mask,
      hidden: this.hidden,
      defaultValue: typeof this.default === 'undefined' ? undefined : String(this.default),
    });

    return input;
  }

  protected async askUntilValid(
    preprocess?: (val: string | undefined) => T,
  ): Promise<T | undefined> {
    let answer = await this.question();
    let pass = true;

    let preprocessedAnswer: T | undefined;

    try {
      if (preprocess) {
        preprocessedAnswer = preprocess(answer);
      } else {
        if (!answer && typeof this.default !== 'undefined') {
          answer = String(this.default);
        }
        preprocessedAnswer = answer as T | undefined;
      }

      pass = await Promise.resolve(this.validate(preprocessedAnswer));
    } catch (err: unknown) {
      if (err instanceof InterruptedError) {
        throw err;
      } else if (err instanceof EndOfFileError) {
        return undefined; // Ctrl+D, return undefined
      }
      pass = false;
      await this.printError(String(err));
    }

    if (!pass) {
      if (typeof this.maxAttempts === 'number') {
        this._attempts++;

        if (this._attempts >= this.maxAttempts) {
          await this.onExceededAttempts?.(preprocessedAnswer, () => {
            return this.askUntilValid(preprocess);
          });

          return;
        }
      }

      return this.askUntilValid(preprocess);
    }

    return preprocessedAnswer;
  }
}

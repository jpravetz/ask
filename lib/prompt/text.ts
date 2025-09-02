import { readLine } from '$io';
import type * as Opts from '$opts';
import * as colors from '@std/fmt/colors';
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
    await this.output.write(
      new TextEncoder().encode(`${colors.red('>>')} ${message}\n`),
    );
  }

  protected printErrorSync(message: string) {
    this.output.writeSync(
      new TextEncoder().encode(`${colors.red('>>')} ${message}\n`),
    );
  }

  protected async question(): Promise<string | undefined> {
    const prompt = new TextEncoder().encode(this.getPrompt());

    await this.output.write(prompt);

    if ((this.hidden || this.mask) && this.input === Deno.stdin) {
      (this.input as typeof Deno.stdin).setRaw(true);
    }

    const input = await readLine({
      input: this.input,
      output: this.output,
      mask: this.mask,
      hidden: this.hidden,
      defaultValue: this.default as string,
    });

    return input;
  }

  protected async askUntilValid(
    preprocess?: (val: string | undefined) => T,
  ): Promise<T | undefined> {
    let answer = await this.question();
    let pass = true;

    if (!answer && this.default) {
      answer = String(this.default);
    }

    let preprocessedAnswer: T | undefined;

    try {
      if (preprocess) {
        preprocessedAnswer = preprocess(answer);
      } else {
        preprocessedAnswer = answer as T | undefined;
      }

      pass = await Promise.resolve(this.validate(preprocessedAnswer));
    } catch (err: unknown) {
      pass = false;
      await this.printError(String(err));
    }

    if (!pass) {
      if (typeof this.maxAttempts === 'number') {
        this._attempts++;

        if (this._attempts >= this.maxAttempts) {
          await this.onExceededAttempts?.(preprocessedAnswer, () => {
            return this.askUntilValid(preprocess) as unknown;
          });

          return;
        }
      }

      return this.askUntilValid(preprocess);
    }

    return preprocessedAnswer;
  }
}

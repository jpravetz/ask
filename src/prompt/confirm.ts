import { EndOfFileError, InterruptedError } from '$errors';
import { Fmt } from '$fmt';

import type * as Opts from '$opts';
import type { Result } from '$types';
import { TextPrompt } from './text.ts';

/**
 * A confirm (yes/no) prompt.
 */
export class ConfirmPrompt<T extends Opts.Confirm> extends TextPrompt<boolean> {
  private accept: string;
  private deny: string;
  #answer: Record<'true' | 'false', string>;

  constructor(opts: T) {
    super(opts);
    this.type = 'confirm';

    this.accept = opts.accept ?? 'y1t';
    this.deny = opts.deny ?? 'n0f';
    this.#answer = {
      true: Fmt.yes(opts.acceptDisplay ?? 'Yes'),
      false: Fmt.no(opts.denyDisplay ?? 'No'),
    };

    // const y = this.default === true ? this.accept.charAt(0).toUpperCase() : this.accept;
    // const n = this.default === false ? this.deny.toUpperCase() : this.deny;

    this.message = `${this.message} [${this.accept.charAt(0)}/${this.deny.charAt(0)}]`;
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

      if (answer === undefined) {
        return undefined;
      }

      const finalPrompt = `${this.getPrompt(true)}${answer ? this.#answer.true : this.#answer.false}`;
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
    const yesChars = this.accept.split('');
    const noChars = this.deny.split('');

    await this.start();

    if (this.input === Deno.stdin) {
      (this.input as typeof Deno.stdin).setRaw(true);
    }

    let currentValue: boolean | undefined = this.default;
    let result: string | undefined;
    let ctrlCPressed = false;
    let timer: number | undefined;

    const redraw = async () => {
      await this.output.clearLine();
      let answerStr = '';
      if (currentValue === true) {
        answerStr = this.#answer.true;
      } else if (currentValue === false) {
        answerStr = this.#answer.false;
      }
      await this.output.write(this.getPrompt() + answerStr);
    };

    try {
      while (true) {
        await redraw();
        const data = new Uint8Array(8);
        const n = await this.input.read(data);

        if (!n) {
          break;
        }

        const char = new TextDecoder().decode(data.slice(0, n));
        clearTimeout(timer);
        ctrlCPressed = false;

        if (yesChars.includes(char.toLowerCase())) {
          currentValue = true;
          continue;
        }

        if (noChars.includes(char.toLowerCase())) {
          currentValue = false;
          continue;
        }

        switch (char) {
          case '\u0008': // BS - backspace
          case '\u007f': // DEL - backspace
            currentValue = undefined;
            continue;
          case '\u0004': // EOT - ctrl+d
            throw new EndOfFileError();
          case '\u001b': // ESC
            throw new InterruptedError();
          case '\u0003': // ETX - ctrl+c
            if (ctrlCPressed) {
              clearTimeout(timer);
              throw new EndOfFileError('Terminated by user');
            }
            ctrlCPressed = true;
            timer = setTimeout(() => (ctrlCPressed = false), 400);
            continue; // Continue to loop and redraw
          case '\r': // CR
          case '\n': // LF
            if (currentValue !== undefined) {
              if (currentValue === true) {
                result = this.accept;
              } else {
                // currentValue is false
                result = this.deny;
              }
            }
            // If currentValue is undefined, do nothing and let the loop continue.
            break;
          default:
            // ignore other characters
            break;
        }
        if (result !== undefined) {
          break;
        }
      }
    } finally {
      clearTimeout(timer);
      if (this.input === Deno.stdin) {
        (this.input as typeof Deno.stdin).setRaw(false);
      }
    }

    return result;
  }
}

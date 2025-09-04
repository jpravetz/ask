import { Fmt } from '$fmt';
import * as IO from '$io';
import type * as Opts from '$opts';
import type { Closer, Reader, ReaderSync } from '@std/io';
import type { PromptType } from './types.ts';

function onExceededAttempts() {
  throw new Error('Maximum attempts exceeded.');
}

/**
 * The base class for all prompt types. This class contains the common logic
 * that is shared between all prompt types.
 */
export class Prompt<T> {
  protected name: string;
  protected type: PromptType;
  protected message: string;
  protected prefix?: string;
  protected suffix?: string;
  protected indent?: string;
  protected default?: T;
  protected input: Reader & ReaderSync & Closer;
  protected output: IO.Writer;
  protected validate: (val?: T | undefined) => boolean | Promise<boolean>;
  protected maxAttempts?: number;
  protected onExceededAttempts?: (
    lastInput?: T,
    retryFn?: () => Promise<T | undefined>,
  ) => void | Promise<void>;

  constructor(opts: Opts.Prompt<T>) {
    this.name = opts.name;
    this.type = opts.type ?? 'input';
    this.message = opts.message ?? opts.name;
    this.prefix = opts.prefix === undefined ? Fmt.questionPrefix : opts.prefix;
    this.suffix = opts.suffix ??
      (!opts.message && opts.suffix === null ? ':' : '');
    if (typeof opts.indent === 'number') {
      this.indent = ' '.repeat(opts.indent);
    } else {
      this.indent = opts.indent ?? '  ';
    }
    this.default = opts.default;
    this.input = opts.input ?? Deno.stdin;
    this.output = new IO.Writer(opts.output);
    this.validate = opts.validate ?? (() => true);
    this.maxAttempts = opts.maxAttempts;
    this.onExceededAttempts = opts.onExceededAttempts ?? onExceededAttempts;
  }

  private format(str: string, final = false): string {
    return (
      Fmt.question(str, final) + this.suffix
    );
  }

  protected getPrompt(final = false): string {
    let prompt = '';

    if (this.indent?.length) {
      prompt += this.indent;
    }

    if (this.prefix?.length) {
      prompt += this.prefix + ' ';
    }

    prompt += this.format(this.message, final) + ' ';

    return prompt;
  }

  protected async redraw(message: string): Promise<void> {
    return await this.output.redraw(message);
  }
}

import type * as StdIo from '@std/io';

/**
 * A high-level writer for terminal output.
 *
 * This class wraps a standard output stream (like `Deno.stdout`) and provides
 * convenient methods for manipulating the terminal using ANSI escape codes. It
 * simplifies tasks like moving the cursor, clearing lines, and changing cursor
 * visibility, which are essential for creating interactive command-line prompts.
 */
export class Writer {
  protected output: StdIo.Writer & StdIo.WriterSync & StdIo.Closer;
  #textEncoder: TextEncoder;

  /**
   * Constructs a new `Writer` instance.
   * @param {StdIo.Writer & StdIo.WriterSync & StdIo.Closer} [output=Deno.stdout] The output stream to write to.
   */
  constructor(output?: StdIo.Writer & StdIo.WriterSync & StdIo.Closer) {
    this.output = output ?? Deno.stdout;
    this.#textEncoder = new TextEncoder();
  }

  /**
   * Moves the cursor to the beginning of the current line.
   */
  async gotoBeginningOfLine(): Promise<void> {
    await this.write('\r');
  }

  /**
   * Moves the cursor up one line.
   */
  async goUp(): Promise<void> {
    await this.write('\x1b[A');
  }

  /**
   * Redraws the final line of a prompt with its answer.
   *
   * This method is typically called at the end of a prompt's lifecycle. It
   * replaces the interactive prompt components with a single, static line
   * representing the question and its final answer.
   * @param {string} message The single-line message to write.
   */
  async redraw(message: string): Promise<void> {
    await this.clearLine();
    await this.write(message);
    await this.newLine();
  }

  /**
   * Asynchronously writes a string or Uint8Array to the output stream.
   *
   * This method does not automatically add a newline character.
   * @param {string | Uint8Array} s The content to write.
   */
  async write(s: string | Uint8Array): Promise<void> {
    if (typeof s === 'string') {
      await this.output.write(this.#textEncoder.encode(s));
    } else {
      await this.output.write(s);
    }
  }

  /**
   * Synchronously writes a string or Uint8Array to the output stream.
   *
   * This method does not automatically add a newline character.
   * @param {string | Uint8Array} s The content to write.
   */
  writeSync(s: string | Uint8Array) {
    if (typeof s === 'string') {
      this.output.writeSync(this.#textEncoder.encode(s));
    } else {
      this.output.writeSync(s);
    }
  }

  /**
   * Writes one or more newline characters to the output.
   * @param {number} [repeat=1] The number of newlines to write.
   */
  async newLine(repeat = 1): Promise<void> {
    await this.write('\n'.repeat(repeat));
  }

  /**
   * Clears the current line from the cursor to the end and moves the cursor to the beginning.
   */
  async clearLine(): Promise<void> {
    await this.write('\r\x1b[K');
  }

  /**
   * Hides the terminal cursor.
   */
  async hideCursor(): Promise<void> {
    await this.write('\x1b[?25l');
  }

  /**
   * Shows the terminal cursor.
   */
  async showCursor(): Promise<void> {
    await this.write('\x1b[?25h');
  }

  /**
   * Deletes the current line and moves the cursor up one position.
   */
  async deleteLine(): Promise<void> {
    await this.gotoBeginningOfLine();
    await this.clearLine();
    await this.goUp();
  }

  /**
   * Clears the content of the current line.
   */
  async clearPromptLine(): Promise<void> {
    await this.gotoBeginningOfLine();
    await this.write('\x1b[K');
  }
}

import type * as StdIo from '@std/io';

export class Writer {
  protected output: StdIo.Writer & StdIo.WriterSync & StdIo.Closer;
  #textEncoder: TextEncoder;

  constructor(output?: StdIo.Writer & StdIo.WriterSync & StdIo.Closer) {
    this.output = output ?? Deno.stdout;
    this.#textEncoder = new TextEncoder();
  }

  async gotoBeginningOfLine(): Promise<void> {
    await this.write('\r');
  }

  async goUp(): Promise<void> {
    await this.write('\x1b[A');
  }

  async redraw(message: string): Promise<void> {
    await this.clearLine();
    await this.write(message);
    await this.newLine();
  }

  async write(s: string): Promise<void> {
    await this.output.write(this.#textEncoder.encode(s));
  }

  async newLine(repeat = 1): Promise<void> {
    await this.write('\n'.repeat(repeat));
  }

  async clearLine(): Promise<void> {
    await this.write('\r\x1b[K');
  }

  async hideCursor(): Promise<void> {
    await this.write('\x1b[?25l');
  }

  async showCursor(): Promise<void> {
    await this.write('\x1b[?25h');
  }

  async deleteLine(): Promise<void> {
    await this.gotoBeginningOfLine();
    await this.clearLine();
    await this.goUp();
  }

  async clearPromptLine(): Promise<void> {
    await this.gotoBeginningOfLine();
    await this.write('\x1b[K');
  }
}

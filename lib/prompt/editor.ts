import { getPreferredEditor, unIro } from '$io';
import type * as Opts from '$opts';
import type { Result } from '$types';
import * as colors from '@std/fmt/colors';
import { Prompt } from './base.ts';

/**
 * A prompt that will open a temporary file in the user's preferred editor and
 * will return the contents of the file when the editor is closed.
 */
export class EditorPrompt<T extends Opts.Editor> extends Prompt<string | undefined> {
  private editorPathOverride?: string;
  private editorPromptMessage?: string;

  constructor(opts: T) {
    super(opts);
    this.type = 'editor';

    this.editorPathOverride = opts.editorPath;
    this.editorPromptMessage = opts.editorPromptMessage;
  }

  private getEditorPrompt(): string {
    if (this.editorPromptMessage) {
      return this.editorPromptMessage;
    }

    return colors.gray(`Press ${colors.blue('<enter>')} to launch your preferred editor.`);
  }

  private async launch(): Promise<string | undefined> {
    if (this.input === Deno.stdin) {
      (this.input as typeof Deno.stdin).setRaw(true);
    }

    while (true) {
      const buffer = new Uint8Array(1);
      await this.input.read(buffer);

      if (buffer[0] === 3) {
        throw new Error('Editor prompt was canceled.');
      }

      if (buffer[0] === 13) {
        break;
      }
    }

    if (this.input === Deno.stdin) {
      (this.input as typeof Deno.stdin).setRaw(false);
    }

    const editorPath = this.editorPathOverride ?? (await getPreferredEditor());

    if (!editorPath) {
      throw new Error(
        'No preferred editor found. Set the VISUAL or EDITOR environment variable.',
      );
    }

    const tempFile = await Deno.makeTempFile({ prefix: 'ask_' });

    const process = new Deno.Command(editorPath, {
      args: [tempFile],
    });

    const child = process.spawn();
    await child.output();

    const data = await Deno.readTextFile(tempFile);
    await Deno.remove(tempFile);

    return data;
  }

  /**
   * Opens a temporary file in the user's preferred editor and returns the
   * contents of the file when the editor is closed.
   */
  async run(): Promise<Result<T, string | undefined>> {
    await this.output.write(this.getPrompt());

    const editorPromptStr = this.getEditorPrompt();
    const editorPrompt = new TextEncoder().encode(editorPromptStr);
    const editorPromptLen = unIro(editorPromptStr).length;
    await this.output.write(editorPrompt);

    const data = await this.launch();

    await this.output.write(this.getPrompt(true));
    await this.output.write(' '.repeat(editorPromptLen));
    await this.output.newLine();

    const result = {
      [this.name]: data,
    } as Result<T, string | undefined>;

    return result;
  }
}

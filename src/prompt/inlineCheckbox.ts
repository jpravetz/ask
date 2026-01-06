import { EndOfFileError, InterruptedError } from '$errors';
import { Fmt } from '$fmt';
import * as List from '$list';
import type * as Opts from '$opts';
import type { Choice, Result } from '$types';
import * as colors from '@std/fmt/colors';
import { Prompt } from './base.ts';

export class InlineCheckboxPrompt<T extends Opts.InlineCheckbox> extends Prompt<unknown> {
  private choices: Choice[];
  private selectedPrefix: string;
  private unselectedPrefix: string;
  private finalSelectedPrefix: string;
  private finalUnselectedPrefix: string;
  protected override suffix?: string;

  private _active: number = 0;
  private _items: List.Item[];
  private _running: boolean = true;

  constructor(opts: Opts.InlineCheckbox) {
    super(opts);
    this.type = 'inlineCheckbox';
    this.choices = opts.choices;
    this.selectedPrefix = opts.selectedPrefix ?? Fmt.inlineCheckbox.prefix.selected;
    this.unselectedPrefix = opts.unselectedPrefix ?? Fmt.inlineCheckbox.prefix.unselected;
    this.finalSelectedPrefix = opts.finalSelectedPrefix ?? Fmt.inlineCheckbox.prefix.finalSelected;
    this.finalUnselectedPrefix = opts.finalUnselectedPrefix ?? Fmt.inlineCheckbox.prefix.finalUnselected;
    this.suffix = opts.suffix;

    if (this.default) {
      const indexOfDefault = this.choices.findIndex(
        (choice) => choice.value === this.default,
      );
      if (indexOfDefault >= 0) {
        this._active = indexOfDefault;
      }
    }

    this._items = this.choices.map((choice, idx) => {
      return new List.Item({
        message: choice.message,
        value: choice.value,
        disabled: choice.disabled ?? false,
        active: idx === this._active,
        selected: (opts.default as string[])?.includes(choice.value as string) ? true : false,
        selectedPrefix: this.selectedPrefix,
        unselectedPrefix: this.unselectedPrefix,
        inactiveFormatter: (message: string, selected: boolean) => {
          const formatted = selected
            ? Fmt.inlineCheckbox.selected(message)
            : Fmt.inlineCheckbox.unselected(message);
          return Fmt.inlineCheckbox.inactive(formatted);
        },
        activeFormatter: (message: string, selected: boolean) => {
          const formatted = selected
            ? Fmt.inlineCheckbox.selected(message)
            : Fmt.inlineCheckbox.unselected(message);
          return Fmt.inlineCheckbox.active(formatted);
        },
        disabledFormatter: (message: string, _selected: boolean) => {
          return colors.gray(message);
        },
      });
    });
  }

  private left() {
    this._items[this._active].active = false;
    this._active = Math.max(0, this._active - 1);
    this._items[this._active].active = true;
  }

  private right() {
    this._items[this._active].active = false;
    this._active = Math.min(this.choices.length - 1, this._active + 1);
    this._items[this._active].active = true;
  }

  private finish() {
    this._running = false;
  }

  private select() {
    this._items[this._active].selected = !this._items[this._active].selected;
  }

  private enter() {
    this.finish();
  }

  protected override getPrompt(final = false): string {
    let prompt = '';
    if (this.indent?.length) {
      prompt += this.indent;
    }
    if (final) {
      prompt += Fmt.question(this.message, true);
    } else {
      prompt += this.message;
    }
    return prompt;
  }

  async run(): Promise<Result<T, unknown[]> | undefined> {
    try {
      await this.start();
      if (this.input === Deno.stdin) {
        (this.input as typeof Deno.stdin).setRaw(true);
      }
      await this.output.hideCursor();

      const render = async () => {
        let p = this.getPrompt();
        const choices = this._items.map((item) => item.format()).join(' ');
        p = `${p} ${choices}`;
        if (this.suffix) {
          p = `${p} ${this.suffix}`;
        }
        await this.output.write(p);
      };
      let ctrlCPressed = false;
      let timer;

      try {
        while (this._running) {
          await render();

          const data = new Uint8Array(3);
          const n = await this.input.read(data);
          await this.output.clearPromptLine();

          if (!n) {
            break;
          }

          const str = new TextDecoder().decode(data.slice(0, n));

          switch (str) {
            case '\u0004': // EOT
              throw new EndOfFileError();
            case '\u001b': // ESC
              throw new InterruptedError();

            case '\u0003': // ETX
              if (ctrlCPressed) {
                clearTimeout(timer);
                throw new EndOfFileError('Terminated by user');
              }
              ctrlCPressed = true;
              timer = setTimeout(() => ctrlCPressed = false, 400);
              break;

            case '\r': // CR
            case '\n': // LF
              this.enter();
              break;

            case '\u0020': // SPACE
              this.select();
              break;

            case '\u001b[D': // left
              this.left();
              break;

            case '\u001b[C': // right
              this.right();
              break;
          }
        }
      } catch (err) {
        if (err instanceof InterruptedError) {
          // This is caught by the outer try/catch
        }
        throw err;
      } finally {
        await this.output.showCursor();
        if (this.input === Deno.stdin) {
          (this.input as typeof Deno.stdin).setRaw(false);
        }
      }

      await this.output.clearPromptLine();

      const selectedItems = this._items.filter((item) => item.selected);
      const selectedValues = selectedItems.map((item) => item.value);

      let finalPrompt = this.getPrompt(true);
      const finalChoices = this._items.map((item) => {
        const prefix = item.selected ? this.finalSelectedPrefix : this.finalUnselectedPrefix;
        if (item.selected) {
          return Fmt.inlineCheckbox.finalSelected(prefix + item.message);
        }
        return Fmt.inlineCheckbox.finalUnselected(prefix + item.message);
      }).join(' ');
      finalPrompt = `${finalPrompt} ${finalChoices}`;
      if (this.suffix) {
        finalPrompt = `${finalPrompt} ${this.suffix}`;
      }

      await this.output.write(finalPrompt);
      await this.output.newLine();

      const result = {
        [this.name]: selectedValues,
      } as Result<T, unknown[]>;

      return result;
    } catch (err) {
      if (err instanceof InterruptedError) {
        return undefined;
      }
      throw err;
    }
  }
}

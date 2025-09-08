import { InterruptedError } from '$errors';
import { Fmt } from '$fmt';
import { renderList } from '$io';
import * as Item from '$item';
import type * as Opts from '$opts';
import type { Choice } from '$types';
import { Prompt } from './base.ts';

export class ListPrompt extends Prompt<unknown> {
  private choices: Choice[];
  private inactiveFormatter?: (message: string, selected: boolean) => string;
  private activeFormatter?: (message: string, selected: boolean) => string;
  private disabledFormatter?: (message: string, selected: boolean) => string;
  private multiple?: boolean;
  private useNumbers?: boolean;
  private columns?: number;
  private selectedPrefix: string;
  private unselectedPrefix: string;

  private _active: number = 0;
  private _items: Item.List[];
  private _running: boolean = true;
  private _originalMessage: string;

  constructor(opts: Opts.List) {
    super(opts);
    this.choices = opts.choices;
    this.inactiveFormatter = opts.inactiveFormatter;
    this.activeFormatter = opts.activeFormatter;
    this.disabledFormatter = opts.disabledFormatter;
    this.multiple = opts.multiple;
    this.useNumbers = opts.useNumbers;
    this.columns = opts.columns ?? 1;
    this.selectedPrefix = opts.selectedPrefix ?? '';
    this.unselectedPrefix = opts.unselectedPrefix ?? '';
    this._originalMessage = this.message;

    if (this.default) {
      const indexOfDefault = this.choices.findIndex(
        (choice) => choice.value === this.default,
      );
      if (indexOfDefault >= 0) {
        this._active = indexOfDefault;
      }
    }

    this._items = this.choices.map((choice, idx) => {
      if (choice instanceof Item.Separator) {
        return choice;
      }

      let message = choice.message;
      if (this.useNumbers && idx < 10) {
        message = `${idx + 1}. ${message}`;
      }

      return new Item.List({
        message: message,
        value: choice.value,
        disabled: choice.disabled ?? false,
        active: idx === this._active,
        selected: this.multiple && (opts.default as string[])?.includes(choice.value as string)
          ? true
          : false,
        selectedPrefix: this.selectedPrefix,
        unselectedPrefix: this.unselectedPrefix,
        inactiveFormatter: this.inactiveFormatter ?? Fmt.inactive,
        activeFormatter: this.activeFormatter ?? Fmt.active,
        disabledFormatter: this.disabledFormatter ?? Fmt.disabled,
      });
    });
  }

  protected override getPrompt(final = false): string {
    return super.getPrompt(final);
  }

  private up(startIndex: number) {
    this._items[this._active].active = false;

    if (this.columns && this.columns > 1) {
      if (this._active - this.columns >= 0) {
        this._active -= this.columns;
      } else {
        // wrap around
        const remaining = this._active;
        const rows = Math.ceil(this.choices.length / this.columns);
        this._active = (rows - 1) * this.columns + remaining;
        if (this._active >= this.choices.length) {
          this._active -= this.columns;
        }
      }
    } else {
      if (this._active === 0) {
        this._active = this.choices.length - 1;
      } else {
        this._active--;
      }
    }

    this._items[this._active].active = true;

    if (this._active === startIndex) {
      return;
    }

    if (this._items[this._active].disabled) {
      this.up(startIndex);
    }
  }

  private down(startIndex: number) {
    this._items[this._active].active = false;

    if (this.columns && this.columns > 1) {
      if (this._active + this.columns < this.choices.length) {
        this._active += this.columns;
      } else {
        // wrap around
        this._active = this._active % this.columns;
      }
    } else {
      if (this._active === this.choices.length - 1) {
        this._active = 0;
      } else {
        this._active++;
      }
    }

    this._items[this._active].active = true;

    if (this._active === startIndex) {
      return;
    }

    if (this._items[this._active].disabled) {
      this.down(startIndex);
    }
  }

  private left() {
    if (this.columns === 1) return;
    this._items[this._active].active = false;
    this._active = Math.max(0, this._active - 1);
    this._items[this._active].active = true;
  }

  private right() {
    if (this.columns === 1) return;
    this._items[this._active].active = false;
    this._active = Math.min(this.choices.length - 1, this._active + 1);
    this._items[this._active].active = true;
  }

  private number(n: number) {
    if (!this.useNumbers) {
      return;
    }

    if (n > 0 && n <= this.choices.length) {
      const item = this._items[n - 1];
      if (item && !item.disabled) {
        this._active = n - 1;
        this._items[this._active].selected = true;
        this.finish();
      }
    }
  }

  private finish() {
    this._running = false;
  }

  private select() {
    if (!this.multiple) {
      return;
    }

    this._items[this._active].selected = !this._items[this._active].selected;
  }

  private enter() {
    if (this.multiple) {
      this.finish();
      return;
    }

    this._items[this._active].selected = true;
    this.finish();
  }

  protected async questionMultiple(): Promise<unknown[] | undefined> {
    this.message = this._originalMessage;
    await this.start();
    await this.output.write(this.getPrompt());
    await this.output.newLine(2);

    // Hide cursor
    await this.output.hideCursor();

    if (this.input === Deno.stdin) {
      (this.input as typeof Deno.stdin).setRaw(true);
    }

    try {
      let _rows = 0;
      while (this._running) {
        _rows = await renderList({
          input: this.input,
          output: this.output,
          items: this._items,
          columns: this.columns,
          indent: this.indent,

          onEnter: this.enter.bind(this),
          onSpace: this.select.bind(this),
          onUp: () => this.up(this._active),
          onDown: () => this.down(this._active),
          onLeft: () => this.left(),
          onRight: () => this.right(),
          onNumber: (n: number) => this.number(n),
        });
      }
      // Clear the list
      for (let i = 0; i < _rows; i++) {
        await this.output.deleteLine();
      }
      // Clear the prompt line and redraw with the answer
      await this.output.clearPromptLine();
    } catch (err) {
      if (err instanceof InterruptedError) {
        return undefined;
      }
      throw err;
    } finally {
      // Show cursor
      await this.output.showCursor();
      if (this.input === Deno.stdin) {
        (this.input as typeof Deno.stdin).setRaw(false);
      }
    }

    // Clear the prompt line and redraw with the answer
    await this.output.clearPromptLine();

    const selectedItems = this._items.filter((item) => item.selected);

    let finalPrompt = this.getPrompt(true);

    if (this.multiple) {
      const _answers = selectedItems.map((item) => {
        let message = item.message;
        if (this.useNumbers) {
          message = message.substring(message.indexOf(' ') + 1);
        }
        return message;
      });
      finalPrompt += Fmt.answer(_answers.join(', '));
    } else if (selectedItems.length === 1) {
      const selected = selectedItems[0];
      const choice = this.choices.find(
        (choice) => choice.value === selected.value,
      );

      if (choice) {
        finalPrompt += Fmt.answer(choice.message);
        // finalPrompt = `${finalPrompt.substring(0, finalPrompt.lastIndexOf(':') + 1)} ${
        //   Fmt.answer(choice.message)
        // }`;
      }
    }

    await this.output.newLine();
    await this.output.write(finalPrompt);
    await this.output.newLine();

    this.message = this._originalMessage;

    return selectedItems.map((item) => {
      let message = item.message;
      if (this.useNumbers) {
        message = message.substring(message.indexOf(' ') + 1);
      }
      return this.choices.find((choice) => choice.message === message)?.value;
    });
  }

  async questionSingle(): Promise<unknown> {
    const result = await this.questionMultiple();
    return result?.[0];
  }
}

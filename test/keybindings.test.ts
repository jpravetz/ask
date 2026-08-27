import { Main as Ask } from '../src/mod.ts';
import { assertEquals } from '@std/assert';

/**
 * A minimal reader that returns a single pre-set byte sequence (one keypress)
 * and then signals end-of-input.
 */
class KeypressInput {
  private data: Uint8Array;
  private pos = 0;

  constructor(bytes: number[]) {
    this.data = new Uint8Array(bytes);
  }

  read(buf: Uint8Array): Promise<number | null> {
    if (this.pos >= this.data.length) {
      return Promise.resolve(null);
    }
    const n = Math.min(buf.length, this.data.length - this.pos);
    buf.set(this.data.subarray(this.pos, this.pos + n));
    this.pos += n;
    return Promise.resolve(n);
  }

  readSync(_buf: Uint8Array): number | null {
    return 0;
  }

  close(): void {}
}

/**
 * A writer sink that discards output. The prompt also emits cursor control
 * sequences through @epdoc/terminal which write to the real stdout; those are
 * harmless in tests.
 */
class DiscardOutput {
  write(p: Uint8Array): Promise<number> {
    return Promise.resolve(p.length);
  }

  writeSync(p: Uint8Array): number {
    return p.length;
  }

  close(): void {}
}

const CHOICES: Array<{ message: string; value: string }> = [
  { message: 'View', value: 'view' },
  { message: 'Edit', value: 'edit' },
];

Deno.test('keyBindings resolve a select prompt with the bound value', async () => {
  const ask = new Ask({
    input: new KeypressInput([0x12]), // CTRL-R
    output: new DiscardOutput(),
    keyBindings: [{ key: 'r', modifier: 'ctrl', value: 'reload' }],
  });

  const result = await ask.select({
    name: 'action',
    message: 'Choose an operation',
    choices: CHOICES,
    useNumbers: true,
  } as const);

  assertEquals(result, { action: 'reload' });
});

Deno.test('keyBindings can bind arrow keys', async () => {
  const ask = new Ask({
    input: new KeypressInput([0x1b, 0x5b, 0x44]), // LEFT arrow
    output: new DiscardOutput(),
    keyBindings: [{ key: 'left', value: 'go-left' }],
  });

  const result = await ask.select({
    name: 'action',
    message: 'Choose an operation',
    choices: CHOICES,
    useNumbers: true,
  } as const);

  assertEquals(result, { action: 'go-left' });
});

Deno.test('keyBindings can bind ctrl with a punctuation key', async () => {
  const ask = new Ask({
    input: new KeypressInput([0x0c]), // CTRL-, (form feed)
    output: new DiscardOutput(),
    keyBindings: [{ key: ',', modifier: 'ctrl', value: 'preferences' }],
  });

  const result = await ask.select({
    name: 'action',
    message: 'Choose an operation',
    choices: CHOICES,
    useNumbers: true,
  } as const);

  assertEquals(result, { action: 'preferences' });
});

Deno.test('keyBindings can be overridden per prompt', async () => {
  const ask = new Ask({
    input: new KeypressInput([0x12]), // CTRL-R
    output: new DiscardOutput(),
    keyBindings: [{ key: 'r', modifier: 'ctrl', value: 'global' }],
  });

  const result = await ask.select({
    name: 'action',
    message: 'Choose an operation',
    choices: CHOICES,
    useNumbers: true,
    keyBindings: [{ key: 'r', modifier: 'ctrl', value: 'local' }],
  } as const);

  assertEquals(result, { action: 'local' });
});

Deno.test('select still resolves a numbered choice without keyBindings', async () => {
  const ask = new Ask({
    input: new KeypressInput([0x31]), // '1'
    output: new DiscardOutput(),
  });

  const result = await ask.select({
    name: 'action',
    message: 'Choose an operation',
    choices: CHOICES,
    useNumbers: true,
  } as const);

  assertEquals(result, { action: 'view' });
});

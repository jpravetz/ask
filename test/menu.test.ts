import { Main as Ask, Menu } from '../src/mod.ts';
import { assertEquals } from '@std/assert';

/**
 * A reader that replays a queue of pre-set keypresses (byte sequences), one
 * keypress per read, and then signals end-of-input.
 */
class QueueInput {
  private chunks: number[][];

  constructor(chunks: number[][]) {
    this.chunks = chunks;
  }

  read(buf: Uint8Array): Promise<number | null> {
    const chunk = this.chunks.shift();
    if (!chunk) {
      return Promise.resolve(null);
    }
    buf.set(new Uint8Array(chunk));
    return Promise.resolve(chunk.length);
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

/**
 * A writer sink that captures the text written through it.
 */
class CaptureOutput {
  private chunks: string[] = [];

  write(p: Uint8Array): Promise<number> {
    this.chunks.push(new TextDecoder().decode(p));
    return Promise.resolve(p.length);
  }

  writeSync(p: Uint8Array): number {
    this.chunks.push(new TextDecoder().decode(p));
    return p.length;
  }

  close(): void {}

  text(): string {
    return this.chunks.join('');
  }
}

const NUM_1 = [0x31]; // '1'
const NUM_2 = [0x32]; // '2'
const ESC = [0x1b]; // ESC
const ZERO = [0x30]; // '0'
const LEFT = [0x1b, 0x5b, 0x44]; // left arrow
const CTRL_R = [0x12]; // CTRL-R

/**
 * A tree with a submenu and an explicit Exit choice, used to terminate the
 * driver loop in tests.
 */
function treeWithLog(rendered: string[]) {
  return {
    root: {
      choices: () => {
        rendered.push('root');
        return [
          { message: 'Sub Menu', node: 'sub' },
          { message: 'Exit', action: () => Menu.EXIT },
        ];
      },
    },
    sub: {
      choices: () => {
        rendered.push('sub');
        return [{ message: 'Back to Root', node: 'root' }];
      },
    },
  };
}

Deno.test('runMenu navigates into a submenu and back via ESC', async () => {
  const rendered: string[] = [];
  const ask = new Ask({ input: new QueueInput([NUM_1, ESC, NUM_2]), output: new DiscardOutput() });

  await Menu.runMenu(treeWithLog(rendered), { ctx: {}, ask });

  assertEquals(rendered, ['root', 'sub', 'root']);
});

Deno.test('runMenu left-arrow at the root is a no-op and does not exit', async () => {
  const rendered: string[] = [];
  const ask = new Ask({ input: new QueueInput([LEFT, NUM_2]), output: new DiscardOutput() });

  await Menu.runMenu(treeWithLog(rendered), { ctx: {}, ask });

  // The left arrow re-renders the root menu instead of offering to exit.
  assertEquals(rendered, ['root', 'root']);
});

Deno.test('runMenu ESC at the root is a no-op and does not exit', async () => {
  const rendered: string[] = [];
  const ask = new Ask({ input: new QueueInput([ESC, NUM_2]), output: new DiscardOutput() });

  await Menu.runMenu(treeWithLog(rendered), { ctx: {}, ask });

  assertEquals(rendered, ['root', 'root']);
});

Deno.test('runMenu supports left-arrow NAV_KEYS to go back from a submenu', async () => {
  const rendered: string[] = [];
  const ask = new Ask({ input: new QueueInput([NUM_1, LEFT, NUM_2]), output: new DiscardOutput() });

  await Menu.runMenu(treeWithLog(rendered), { ctx: {}, ask });

  assertEquals(rendered, ['root', 'sub', 'root']);
});

Deno.test('runMenu runs an action that returns a NodeRef to jump nodes', async () => {
  const rendered: string[] = [];
  const ask = new Ask({ input: new QueueInput([NUM_1, ESC, NUM_2]), output: new DiscardOutput() });

  const tree = {
    root: {
      choices: () => {
        rendered.push('root');
        return [
          { message: 'Go to Messages', action: () => ({ node: 'message' }) },
          { message: 'Exit', action: () => Menu.EXIT },
        ];
      },
    },
    message: {
      choices: () => {
        rendered.push('message');
        return [{ message: 'Back', node: 'root' }];
      },
    },
  };

  await Menu.runMenu(tree, { ctx: {}, ask });

  assertEquals(rendered, ['root', 'message', 'root']);
});

Deno.test('runMenu runs an inline action and stays on the current menu', async () => {
  const rendered: string[] = [];
  let inlineRuns = 0;
  const ask = new Ask({ input: new QueueInput([NUM_1, NUM_2]), output: new DiscardOutput() });

  const tree = {
    root: {
      choices: () => {
        rendered.push('root');
        return [
          {
            message: 'Inline Action',
            action: () => {
              inlineRuns++;
            },
          },
          { message: 'Exit', action: () => Menu.EXIT },
        ];
      },
    },
  };

  await Menu.runMenu(tree, { ctx: {}, ask });

  assertEquals(inlineRuns, 1);
  assertEquals(rendered, ['root', 'root']);
});

Deno.test('runMenu dispatches universal key bindings to registered actions', async () => {
  const rendered: string[] = [];
  let reloads = 0;
  const actions = Menu.createActions({
    reload: () => {
      reloads++;
    },
  });
  const ask = new Ask({ input: new QueueInput([CTRL_R, NUM_2]), output: new DiscardOutput() });

  const tree = {
    root: {
      choices: () => {
        rendered.push('root');
        return [
          { message: 'Nothing', action: () => {} },
          { message: 'Exit', action: () => Menu.EXIT },
        ];
      },
    },
  };

  await Menu.runMenu(tree, {
    ctx: {},
    ask,
    actions,
    keyBindings: [{ key: 'r', modifier: 'ctrl', value: actions.Action.reload, hint: 'Reload' }],
  });

  assertEquals(reloads, 1);
  assertEquals(rendered, ['root', 'root']);
});

Deno.test('runMenu renders key-binding hints separated by a blank line', async () => {
  const out = new CaptureOutput();
  const ask = new Ask({ input: new QueueInput([NUM_2]), output: out });
  const actions = Menu.createActions({ reload: () => {} });

  await Menu.runMenu(treeWithLog([]), {
    ctx: {},
    ask,
    actions,
    keyBindings: [{ key: 'r', modifier: 'ctrl', value: actions.Action.reload, hint: 'Reload' }],
  });

  const text = out.text();
  assertEquals(text.includes('Reload'), true);
  // A blank line separates the hints from the menu choices.
  assertEquals(text.includes('\n  \n'), true);
});

Deno.test('runMenu hides key-binding hints when showKeyBindings is false', async () => {
  const out = new CaptureOutput();
  const ask = new Ask({ input: new QueueInput([NUM_2]), output: out });
  const actions = Menu.createActions({ reload: () => {} });

  await Menu.runMenu(treeWithLog([]), {
    ctx: {},
    ask,
    actions,
    keyBindings: [{ key: 'r', modifier: 'ctrl', value: actions.Action.reload, hint: 'Reload' }],
    showKeyBindings: false,
  });

  assertEquals(out.text().includes('Reload'), false);
});

Deno.test('runMenu resets to root on ReturnToMainMenuError', async () => {
  const rendered: string[] = [];
  const ask = new Ask({
    input: new QueueInput([NUM_1, ZERO, NUM_2]),
    output: new DiscardOutput(),
    returnToMainMenu: 'hidden',
  });

  await Menu.runMenu(treeWithLog(rendered), { ctx: {}, ask });

  assertEquals(rendered, ['root', 'sub', 'root']);
});

Deno.test('createActions derives Action, isActionName, and run', async () => {
  const actions = Menu.createActions<{ n: number }>({
    bump: (ctx) => {
      ctx.n++;
    },
    exit: () => Menu.EXIT,
  });

  assertEquals(actions.Action.bump, 'bump');
  assertEquals(actions.Action.exit, 'exit');
  assertEquals(actions.isActionName('bump'), true);
  assertEquals(actions.isActionName('nope'), false);

  const ctx = { n: 0 };
  await actions.run(ctx, 'bump');
  assertEquals(ctx.n, 1);
  const result = await actions.run(ctx, 'exit');
  assertEquals(result, Menu.EXIT);
});

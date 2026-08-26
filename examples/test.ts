import * as Ask from '@jpravetz/ask';
import * as colors from '@std/fmt/colors';
import { InterruptedError, ReturnToMainMenuError, UserAbortedError } from '../src/errors.ts';

// Default ask instance for most tests
const ask = new Ask.Main();

interface TestResults {
  [key: string]: TestStatus | undefined;
}
type TestStatus = 'passed' | 'failed' | 'aborted';

const log = {
  passed: (s: string): boolean => {
    console.log('\n', colors.green(`${s} test passed`));
    return true;
  },
  failed: (s: string): boolean => {
    console.log('\n', colors.red(`${s} test failed`));
    return false;
  },
  aborted: (s: string): boolean => {
    console.log('\n\n', colors.yellow(`${s} test aborted`));
    return true;
  },
};

async function runTest() {
  console.log('Starting the interactive test suite...');

  const results: TestResults = {};
  const tests: { [key: string]: () => Promise<boolean> } = {
    input: testInput,
    number: testNumber,
    confirm: testConfirm,
    password: testPassword,
    select: testSelect,
    checkbox: testCheckbox,
    inlineCheckbox: testInlineCheckbox,
    escKey: testEscKey,
    ctrlD: testCtrlD,
    ctrlR: testCtrlR,
    ctrlROverride: testCtrlROverride,
    returnToMainMenu: testReturnToMainMenu,
    wordNavigation: testWordNavigation,
  };

  for (const [name, test] of Object.entries(tests)) {
    try {
      const passed = await test();
      results[name] = passed ? 'passed' : 'failed';
    } catch (err) {
      if (err instanceof UserAbortedError) {
        console.log('\nTest suite aborted by user.');
        return;
      } else if (err instanceof InterruptedError) {
        log.aborted(name);
        results[name] = 'aborted';
      } else {
        if (err instanceof Error) {
          console.log(colors.red(err.stack ?? err.message));
        }
        results[name] = 'failed';
      }
    }
  }

  console.log('\nTest Results:');
  for (const [test, result] of Object.entries(results)) {
    let statusText: string;
    switch (result) {
      case 'passed':
        statusText = colors.green('PASSED');
        break;
      case 'failed':
        statusText = colors.red('FAILED');
        break;
      case 'aborted':
        statusText = colors.yellow('ABORTED');
        break;
      default:
        statusText = colors.gray('SKIPPED');
        break;
    }
    console.log(`- ${test}: ${statusText}`);
  }
}

async function testInput(): Promise<boolean> {
  console.log('\n--- Testing Input Prompt ---');
  const result1 = await ask.prompt([
    {
      name: 'text',
      type: 'input',
      message: 'Please test arrow keys, Ctrl-A, and Ctrl-E, then press enter.',
      default: 'some text',
    },
  ]);
  if (result1 === undefined) {
    throw new InterruptedError();
  }
  const { text } = result1 as { text: string };

  const result2 = await ask.prompt([
    {
      name: 'success',
      type: 'confirm',
      message: 'Did you enter ' + colors.green(text) + ' and were able to move the cursor?',
      default: true,
    },
  ]);
  if (result2 === undefined) {
    throw new InterruptedError();
  }
  return result2.success === true;
}

async function testNumber(): Promise<boolean> {
  console.log('\n--- Testing Number Prompt ---');
  const result1 = await ask.prompt([
    {
      name: 'num',
      type: 'number',
      message: 'Please test arrow keys, Ctrl-A, and Ctrl-E, then press enter.',
      default: 12345,
    },
  ]);
  if (result1 === undefined) {
    throw new InterruptedError();
  }
  const { num } = result1 as { num: number };

  const result2 = await ask.prompt([
    {
      name: 'success',
      type: 'confirm',
      message: 'Did you enter ' + colors.green(String(num)) + ' and were able to move the cursor?',
      default: true,
    },
  ]);
  if (result2 === undefined) {
    throw new InterruptedError();
  }
  return result2.success === true;
}

async function testConfirm(): Promise<boolean> {
  console.log('\n--- Testing Confirm Prompt ---');

  const result1 = await ask.prompt([
    {
      name: 'defaultTrue',
      type: 'confirm',
      message: 'Press enter to accept the default (Yes).',
      default: true,
    },
  ]);
  if (result1 === undefined) {
    throw new InterruptedError();
  }
  if (result1.defaultTrue !== true) {
    return log.failed('Default true');
  }

  const result2 = await ask.prompt([
    {
      name: 'defaultFalse',
      type: 'confirm',
      message: 'Press enter to accept the default (No).',
      default: false,
    },
  ]);
  if (result2 === undefined) {
    throw new InterruptedError();
  }
  if (result2.defaultFalse !== false) {
    return log.failed('Default false');
  }

  const result3 = await ask.prompt([
    {
      name: 'typeY',
      type: 'confirm',
      message: "Type 'y' and press enter.",
    },
  ]);
  if (result3 === undefined) {
    throw new InterruptedError();
  }
  if (result3.typeY !== true) {
    return log.failed("Type 'y'");
  }

  const result4 = await ask.prompt([
    {
      name: 'typeN',
      type: 'confirm',
      message: "Type 'n' and press enter.",
    },
  ]);
  if (result4 === undefined) {
    throw new InterruptedError();
  }
  if (result4.typeN !== false) {
    log.failed("Type 'n'");
  }

  return true;
}

async function testPassword(): Promise<boolean> {
  console.log('\n--- Testing Password Prompt ---');
  const result = await ask.password(
    {
      name: 'password',
      message: "Please type 'password123' and press enter.",
    },
  );
  if (result === undefined) {
    throw new InterruptedError();
  }
  if (result.password !== 'password123') {
    return log.failed('Password');
  }
  const result2 = await ask.password(
    {
      name: 'password',
      message: 'Type ENTER if you see xxxx. Otherwise type something else.',
      default: 'mask',
      mask: 'x',
    },
  );
  if (result2 === undefined) {
    throw new InterruptedError();
  }
  if (result2.password !== 'mask') {
    return log.failed('Password');
  }
  const result3 = await ask.password(
    {
      name: 'password',
      message: 'Type ENTER if you see ••••. Otherwise type something else.',
      default: 'mask',
      mask: true,
    },
  );
  if (result3 === undefined) {
    throw new InterruptedError();
  }
  if (result3.password !== 'mask') {
    return log.failed('Password');
  }
  return log.passed('Password');
}

async function testSelect(): Promise<boolean> {
  console.log('\n--- Testing Select Prompt ---');
  const choices: Ask.List.Item[] = [
    new Ask.List.Item({ message: 'Red', value: 'red' } as Ask.List.ItemOpts),
    new Ask.List.Item({ message: 'Green', value: 'green' } as Ask.List.ItemOpts),
    new Ask.List.Item({ message: 'Blue', value: 'blue' } as Ask.List.ItemOpts),
  ];
  const result1 = await ask.prompt([
    {
      name: 'color',
      type: 'select',
      message: 'Please select the color green.',
      choices: choices,
    },
  ]);
  if (result1 === undefined) {
    throw new InterruptedError();
  }
  if (result1.color !== 'green') {
    return log.failed('Select');
  }

  const choices2: Ask.List.Item[] = [
    new Ask.List.Item({ message: 'Bob', value: 'bob' } as Ask.List.ItemOpts),
    new Ask.List.Item({ message: 'Sally', value: 'sally' } as Ask.List.ItemOpts),
    new Ask.List.Item({ message: 'Alice', value: 'alice' } as Ask.List.ItemOpts),
    new Ask.List.Item({ message: 'George', value: 'george', disabled: true } as Ask.List.ItemOpts),
  ];
  const result2 = await ask.prompt([
    {
      name: 'name',
      message: 'Please type 3 to select Alice. George should be disabled.',
      choices: choices2,
      useNumbers: true,
      type: 'select',
    },
  ]);
  if (result2 === undefined) {
    throw new InterruptedError();
  }
  if (result2.name !== 'alice') {
    return log.failed('Select');
  }
  return true;
}

async function testCheckbox(): Promise<boolean> {
  console.log('\n--- Testing Checkbox Prompt ---');
  const choices: Ask.List.Item[] = [
    new Ask.List.Item({ message: 'red', value: 'red' } as Ask.List.ItemOpts),
    new Ask.List.Item({ message: 'green', value: 'green' } as Ask.List.ItemOpts),
    new Ask.List.Item({ message: 'blue', value: 'blue' } as Ask.List.ItemOpts),
  ];
  const result = await ask.prompt([
    {
      name: 'colors',
      type: 'checkbox',
      message: 'Please select the colors red and blue.',
      choices: choices,
    },
  ]);
  if (result === undefined) {
    throw new InterruptedError();
  }
  const { colors } = result as { colors: string[] };
  return Array.isArray(colors) && colors.includes('red') && colors.includes('blue') && colors.length === 2;
}

async function testInlineCheckbox(): Promise<boolean> {
  console.log('\n--- Testing Inline Checkbox Prompt ---');
  const choices: Ask.List.Item[] = [
    new Ask.List.Item({ message: 'red', value: 'red' } as Ask.List.ItemOpts),
    new Ask.List.Item({ message: 'green', value: 'green' } as Ask.List.ItemOpts),
    new Ask.List.Item({ message: 'blue', value: 'blue' } as Ask.List.ItemOpts),
  ];
  const result = await ask.prompt([
    {
      name: 'colors',
      type: 'inlineCheckbox',
      message: 'Please select the colors red and blue.',
      choices: choices,
    },
  ]);
  if (result === undefined) {
    throw new InterruptedError();
  }
  const { colors } = result as { colors: string[] };
  return Array.isArray(colors) && colors.includes('red') && colors.includes('blue') && colors.length === 2;
}

async function testEscKey(): Promise<boolean> {
  console.log('\n--- Testing ESC Key ---');
  const result = await ask.prompt([
    {
      name: 'test',
      type: 'input',
      message: 'Press the ESC key.',
    },
  ]);
  if (result) {
    return log.failed('ESC key press');
  }
  return log.passed('ESC key press');
}

async function testCtrlD(): Promise<boolean> {
  console.log('\n--- Testing Ctrl-D Key ---');
  console.log(
    'Press Ctrl-D. You should be asked to confirm exiting. Choose not to exit, and the prompt should reappear. Then type something and press enter.',
  );
  const result = await ask.prompt([
    {
      name: 'test',
      type: 'input',
      message: "Press Ctrl-D, then choose not to exit, then type 'hello' and press enter.",
    },
  ]);
  if (result === undefined) {
    throw new InterruptedError();
  }
  return result.test === 'hello';
}

async function testCtrlR(): Promise<boolean> {
  console.log('\n--- Testing Ctrl-R Key Binding (global) ---');

  const askReload = new Ask.Main({
    keyBindings: [{ key: 'r', modifier: 'ctrl', value: 'reload' }],
  });
  const result = await askReload.prompt([
    {
      name: 'action',
      type: 'select',
      message: 'Press Ctrl-R. The prompt should resolve with the value "reload".',
      choices: [
        { message: 'View', value: 'view' },
        { message: 'Edit', value: 'edit' },
      ],
      useNumbers: true,
    },
  ]);
  if (result === undefined) {
    throw new InterruptedError();
  }
  if (result.action !== 'reload') {
    return log.failed('Ctrl-R key binding (global)');
  }
  return log.passed('Ctrl-R key binding (global)');
}

async function testCtrlROverride(): Promise<boolean> {
  console.log('\n--- Testing Ctrl-R Key Binding (per-prompt override) ---');

  const askReload = new Ask.Main({
    keyBindings: [{ key: 'r', modifier: 'ctrl', value: 'global' }],
  });
  const result = await askReload.prompt([
    {
      name: 'action',
      type: 'select',
      message: 'Press Ctrl-R. The per-prompt binding should override the global one.',
      choices: [
        { message: 'View', value: 'view' },
        { message: 'Edit', value: 'edit' },
      ],
      useNumbers: true,
      keyBindings: [{ key: 'r', modifier: 'ctrl', value: 'local' }],
    },
  ]);
  if (result === undefined) {
    throw new InterruptedError();
  }
  if (result.action !== 'local') {
    return log.failed('Ctrl-R key binding (per-prompt override)');
  }
  return log.passed('Ctrl-R key binding (per-prompt override)');
}

async function testReturnToMainMenu(): Promise<boolean> {
  console.log('\n--- Testing Return to Main Menu ---');

  const choices: Ask.List.Item[] = [
    new Ask.List.Item({ message: 'Red', value: 'red' } as Ask.List.ItemOpts),
    new Ask.List.Item({ message: 'Green', value: 'green' } as Ask.List.ItemOpts),
    new Ask.List.Item({ message: 'Blue', value: 'blue' } as Ask.List.ItemOpts),
  ];

  // Test case 1: visible footer
  const askVisible = new Ask.Main({ returnToMainMenu: 'visible' });
  console.log('A "0. Return to Main Menu" footer should be visible below the choices. Press 0.');
  try {
    await askVisible.prompt([
      {
        name: 'color',
        type: 'select',
        message: 'Press 0 to return to the main menu.',
        choices: choices,
      },
    ]);
    return log.failed('Return to Main Menu (visible): no error was thrown');
  } catch (err) {
    if (!(err instanceof ReturnToMainMenuError)) {
      console.log(colors.red(err instanceof Error ? err.message : String(err)));
      return log.failed('Return to Main Menu (visible)');
    }
  }

  // Test case 2: hidden
  const askHidden = new Ask.Main({ returnToMainMenu: 'hidden' });
  console.log('No footer should be visible. Press 0 to return to the main menu.');
  try {
    await askHidden.prompt([
      {
        name: 'color',
        type: 'select',
        message: 'Press 0 to return to the main menu (footer is hidden).',
        choices: choices,
      },
    ]);
    return log.failed('Return to Main Menu (hidden): no error was thrown');
  } catch (err) {
    if (!(err instanceof ReturnToMainMenuError)) {
      console.log(colors.red(err instanceof Error ? err.message : String(err)));
      return log.failed('Return to Main Menu (hidden)');
    }
  }

  // Test case 3: off — pressing 0 should be ignored
  const askOff = new Ask.Main();
  console.log('Press 0 (nothing should happen), then select Green with the down arrow and press enter.');
  const result = await askOff.prompt([
    {
      name: 'color',
      type: 'select',
      message: 'Press 0 (should be ignored), then select Green.',
      choices: choices,
      useNumbers: true,
    },
  ]);
  if (result === undefined) {
    throw new InterruptedError();
  }
  if (result.color !== 'green') {
    return log.failed('Return to Main Menu (off)');
  }

  return log.passed('Return to Main Menu');
}

async function testWordNavigation(): Promise<boolean> {
  console.log('\n--- Testing Word Navigation ---');
  const result1 = await ask.prompt([
    {
      name: 'text',
      type: 'input',
      message: 'Please test Ctrl+Left/Right and Opt+Left/Right for word navigation.',
      default: 'some long text to navigate',
    },
  ]);
  if (result1 === undefined) {
    throw new InterruptedError();
  }
  const result2 = await ask.prompt([
    {
      name: 'success',
      type: 'confirm',
      message: 'Did word navigation work as expected?',
    },
  ]);
  if (result2 === undefined) {
    throw new InterruptedError();
  }
  return result2.success === true;
}

runTest();

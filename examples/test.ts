import * as colors from '@std/fmt/colors';
import { InterruptedError, UserAbortedError } from '../lib/errors.ts';
import { ListItem } from '../lib/item/list.ts';
import { Main as Ask } from '../mod.ts';
import type { GlobalPromptOpts } from '../lib/opts/global.ts';

// Default ask instance for most tests
const ask = new Ask();

interface TestResults {
  [key: string]: TestStatus | undefined;
}
type TestStatus = 'passed' | 'failed' | 'aborted';

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
        console.log(colors.yellow(`\nTest '${name}' aborted.`));
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
    },
  ]);
  if (result2 === undefined) {
    throw new InterruptedError();
  }
  return result2.success;
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
    },
  ]);
  if (result2 === undefined) {
    throw new InterruptedError();
  }
  return result2.success;
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
    console.log('Default true test failed.');
    return false;
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
    console.log('Default false test failed.');
    return false;
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
    console.log("Type 'y' test failed.");
    return false;
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
    console.log("Type 'n' test failed.");
    return false;
  }

  return true;
}

async function testPassword(): Promise<boolean> {
  console.log('\n--- Testing Password Prompt ---');
  const result = await ask.prompt([
    {
      name: 'password',
      type: 'password',
      message: "Please type 'password123' and press enter.",
    },
  ]);
  if (result === undefined) {
    throw new InterruptedError();
  }
  if (result.password === 'password123') {
    console.log('Password test passed!');
    return true;
  }
  console.log('Password test failed.');
  return false;
}

async function testSelect(): Promise<boolean> {
  console.log('\n--- Testing Select Prompt ---');
  const choices: ListItem[] = [
    new ListItem({ message: 'red', value: 'red' }),
    new ListItem({ message: 'green', value: 'green' }),
    new ListItem({ message: 'blue', value: 'blue' }),
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
    console.log('\nSelect failed');
    return false;
  }

  const choices2: ListItem[] = [
    new ListItem({ message: 'Bob', value: 'bob' }),
    new ListItem({ message: 'Sally', value: 'sally' }),
    new ListItem({ message: 'Alice', value: 'alice' }),
    new ListItem({ message: 'George', value: 'george', disabled: true }),
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
  return result2.name === 'alice';
}

async function testCheckbox(): Promise<boolean> {
  console.log('\n--- Testing Checkbox Prompt ---');
  const choices: ListItem[] = [
    new ListItem({ message: 'red', value: 'red' }),
    new ListItem({ message: 'green', value: 'green' }),
    new ListItem({ message: 'blue', value: 'blue' }),
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
  const choices: ListItem[] = [
    new ListItem({ message: 'red', value: 'red' }),
    new ListItem({ message: 'green', value: 'green' }),
    new ListItem({ message: 'blue', value: 'blue' }),
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
    console.log('\nESC key was not pressed. Test failed.');
    return false;
  }
  console.log('\nESC key pressed. Test passed!');
  return true;
}

async function testCtrlD(): Promise<boolean> {
  console.log('\n--- Testing Ctrl-D Key ---');
  console.log('Press Ctrl-D. You should be asked to confirm exiting. Choose not to exit, and the prompt should reappear. Then type something and press enter.');
  const result = await ask.prompt([
    {
      name: 'test',
      type: 'input',
      message: 'Press Ctrl-D, then choose not to exit, then type \'hello\' and press enter.',
    },
  ]);
  if (result === undefined) {
    throw new InterruptedError();
  }
  return result.test === 'hello';
}

async function testCtrlR(): Promise<boolean> {
  console.log('\n--- Testing Ctrl-R Key ---');

  // Test case 1: onCtrlR returns true
  const askSuccess = new Ask({
    onCtrlR: async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return true;
    },
  });
  const result1 = await askSuccess.prompt([
    {
      name: 'test1',
      type: 'input',
      message: 'Press Ctrl-R. You should see a spinner and then a green circle.',
    },
  ]);
  if (result1 === undefined) {
    throw new InterruptedError();
  }
  const confirm1 = await ask.prompt([
    {
      name: 'success',
      type: 'confirm',
      message: 'Did you see the green circle?',
    },
  ]);
  if (confirm1 === undefined) {
    throw new InterruptedError();
  }
  if (!confirm1.success) return false;

  // Test case 2: onCtrlR returns false
  const askFail = new Ask({
    onCtrlR: async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return false;
    },
  });
  const result2 = await askFail.prompt([
    {
      name: 'test2',
      type: 'input',
      message: 'Press Ctrl-R. You should see a spinner and then a red circle.',
    },
  ]);
  if (result2 === undefined) {
    throw new InterruptedError();
  }
  const confirm2 = await ask.prompt([
    {
      name: 'success',
      type: 'confirm',
      message: 'Did you see the red circle?',
    },
  ]);
  if (confirm2 === undefined) {
    throw new InterruptedError();
  }
  if (!confirm2.success) return false;

  // Test case 3: onCtrlR returns void
  const askVoid = new Ask({
    onCtrlR: async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    },
  });
  const result3 = await askVoid.prompt([
    {
      name: 'test3',
      type: 'input',
      message: 'Press Ctrl-R. The spinner should revert to the original prompt prefix.',
    },
  ]);
  if (result3 === undefined) {
    throw new InterruptedError();
  }
  const confirm3 = await ask.prompt([
    {
      name: 'success',
      type: 'confirm',
      message: 'Did the prompt prefix revert correctly?',
    },
  ]);
  if (confirm3 === undefined) {
    throw new InterruptedError();
  }
  return confirm3.success;
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
  return result2.success;
}

runTest();
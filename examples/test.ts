import * as colors from '@std/fmt/colors';
import { EndOfFileError, InterruptedError } from '../lib/errors.ts';
import { ListItem } from '../lib/item/list.ts';
import { Main as Ask } from '../mod.ts';

const ask = new Ask();

interface TestResults {
  [key: string]: boolean | undefined;
}

async function runTest() {
  console.log('Starting the interactive test suite...');

  const results: TestResults = {};
  const tests = {
    input: testInput,
    number: testNumber,
    confirm: testConfirm,
    password: testPassword,
    select: testSelect,
    checkbox: testCheckbox,
    inlineCheckbox: testInlineCheckbox,
    escKey: testEscKey,
    ctrlD: testCtrlD,
  };

  for (const [name, test] of Object.entries(tests)) {
    let passed = false;
    while (!passed) {
      try {
        results[name] = await test();
        passed = true;
      } catch (err) {
        if (name !== 'ctrlD' && err instanceof EndOfFileError) {
          const { exit } = (await ask.prompt([
            {
              name: 'exit',
              type: 'confirm',
              message: '\nYou pressed Ctrl-D. Do you want to exit the test suite?',
              default: true,
            },
          ])) as { exit: boolean };
          if (exit) {
            console.log('Exiting test suite.');
            return;
          }
          results[name] = false;
        } else if (err instanceof InterruptedError) {
          results[name] = true;
          passed = true;
        } else {
          if (err instanceof Error) {
            console.log(err.message);
          }
          results[name] = false;
          passed = true; // Don't re-run tests that fail for other reasons
        }
      }
    }
  }

  console.log('\nTest Results:');
  for (const [test, result] of Object.entries(results)) {
    console.log(
      `- ${test}: ${result ? colors.green('PASSED') : colors.red('FAILED')}`,
    );
  }
}

async function testInput() {
  console.log('\n--- Testing Input Prompt ---');
  const { text } = (await ask.prompt([
    {
      name: 'text',
      type: 'input',
      message: 'Please test arrow keys, Ctrl-A, and Ctrl-E, then press enter.',
      default: 'some text',
    },
  ])) as { text: string };
  const { success } = (await ask.prompt([
    {
      name: 'success',
      type: 'confirm',
      message: 'Did you enter ' + colors.green(text) + ' and were able to move the cursor?',
    },
  ])) as { success: boolean };
  return success;
}

async function testNumber() {
  console.log('\n--- Testing Number Prompt ---');
  const { num } = (await ask.prompt([
    {
      name: 'num',
      type: 'number',
      message: 'Please test arrow keys, Ctrl-A, and Ctrl-E, then press enter.',
      default: 12345,
    },
  ])) as { num: number };
  const { success } = (await ask.prompt([
    {
      name: 'success',
      type: 'confirm',
      message: 'Did you enter ' + colors.green(String(num)) + ' and were able to move the cursor?',
    },
  ])) as { success: boolean };
  return success;
}

async function testConfirm() {
  console.log('\n--- Testing Confirm Prompt ---');

  const { defaultTrue } = (await ask.prompt([
    {
      name: 'defaultTrue',
      type: 'confirm',
      message: 'Press enter to accept the default (Yes).',
      default: true,
    },
  ])) as { defaultTrue: boolean };
  if (defaultTrue !== true) {
    console.log('Default true test failed.');
    return false;
  }

  const { defaultFalse } = (await ask.prompt([
    {
      name: 'defaultFalse',
      type: 'confirm',
      message: 'Press enter to accept the default (No).',
      default: false,
    },
  ])) as { defaultFalse: boolean };
  if (defaultFalse !== false) {
    console.log('Default false test failed.');
    return false;
  }

  const { typeY } = (await ask.prompt([
    {
      name: 'typeY',
      type: 'confirm',
      message: "Type 'y' and press enter.",
    },
  ])) as { typeY: boolean };
  if (typeY !== true) {
    console.log("Type 'y' test failed.");
    return false;
  }

  const { typeN } = (await ask.prompt([
    {
      name: 'typeN',
      type: 'confirm',
      message: "Type 'n' and press enter.",
    },
  ])) as { typeN: boolean };
  if (typeN !== false) {
    console.log("Type 'n' test failed.");
    return false;
  }

  return true;
}

async function testPassword() {
  console.log('\n--- Testing Password Prompt ---');
  const { password } = (await ask.prompt([
    {
      name: 'password',
      type: 'password',
      message: "Please type 'password123' and press enter.",
    },
  ])) as { password: string };
  if (password === 'password123') {
    console.log('Password test passed!');
    return true;
  }
  console.log('Password test failed.');
  return false;
}

async function testSelect() {
  console.log('\n--- Testing Select Prompt ---');
  const choices: ListItem[] = [
    new ListItem({ message: 'red', value: 'red', disabled: false, selected: false, active: false }),
    new ListItem({ message: 'green', value: 'green', disabled: false, selected: false, active: false }),
    new ListItem({ message: 'blue', value: 'blue', disabled: false, selected: false, active: false }),
  ];
  const { color } = (await ask.prompt([
    {
      name: 'color',
      type: 'select',
      message: 'Please select the color green.',
      choices: choices,
    },
  ])) as { color: string };
  if (color !== 'green') {
    console.log('\nSelect failed');
    return false;
  }

  const choices2: ListItem[] = [
    new ListItem({ message: 'Bob', value: 'bob', disabled: false, selected: false, active: false }),
    new ListItem({ message: 'Sally', value: 'sally', disabled: false, selected: false, active: false }),
    new ListItem({ message: 'Alice', value: 'alice', disabled: false, selected: false, active: false }),
    new ListItem({ message: 'George', value: 'george', disabled: true, selected: false, active: false }),
  ];
  const { name } = (await ask.select(
    {
      name: 'name',
      message: 'Please type 3 to select Alice. George should be disabled.',
      choices: choices2,
      useNumbers: true,
    },
  )) as { name: string };
  return name === 'alice';
}

async function testCheckbox() {
  console.log('\n--- Testing Checkbox Prompt ---');
  const choices: ListItem[] = [
    new ListItem({ message: 'red', value: 'red', disabled: false, selected: false, active: false }),
    new ListItem({ message: 'green', value: 'green', disabled: false, selected: false, active: false }),
    new ListItem({ message: 'blue', value: 'blue', disabled: false, selected: false, active: false }),
  ];
  const { colors } = (await ask.prompt([
    {
      name: 'colors',
      type: 'checkbox',
      message: 'Please select the colors red and blue.',
      choices: choices,
    },
  ])) as { colors: string[] };
  return Array.isArray(colors) && colors.includes('red') && colors.includes('blue') && colors.length === 2;
}

async function testInlineCheckbox() {
  console.log('\n--- Testing Inline Checkbox Prompt ---');
  const choices: ListItem[] = [
    new ListItem({ message: 'red', value: 'red', disabled: false, selected: false, active: false }),
    new ListItem({ message: 'green', value: 'green', disabled: false, selected: false, active: false }),
    new ListItem({ message: 'blue', value: 'blue', disabled: false, selected: false, active: false }),
  ];
  const { colors } = (await ask.prompt([
    {
      name: 'colors',
      type: 'inlineCheckbox',
      message: 'Please select the colors red and blue.',
      choices: choices,
    },
  ])) as { colors: string[] };
  return Array.isArray(colors) && colors.includes('red') && colors.includes('blue') && colors.length === 2;
}

async function testEscKey() {
  console.log('\n--- Testing ESC Key ---');
  const result = await ask.prompt([
    {
      name: 'test',
      type: 'input',
      message: 'Press the ESC key.',
    },
  ]);
  if (result && result.test) {
    console.log('\nESC key was not pressed. Test failed.');
    return false;
  }
  console.log('\nESC key pressed. Test passed!');
  return true;
}

async function testCtrlD() {
  console.log('\n--- Testing Ctrl-D Key ---');
  try {
    await ask.prompt([
      {
        name: 'test',
        type: 'input',
        message: 'Press the Ctrl-D key.',
      },
    ]);
    console.log('Ctrl-D key was not pressed. Test failed.');
    return false;
  } catch (err) {
    if (err instanceof EndOfFileError) {
      console.log('Ctrl-D key pressed. Test passed!');
      return true;
    }
    throw err;
  }
}

runTest();

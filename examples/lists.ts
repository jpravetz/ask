import * as Ask from '../mod.ts';

const _opts = { prefix: '\n' + ' '.repeat(6), suffix: '\n' };
const ask = new Ask.Main({ prefix: '', indent: 15 });

const result = await ask.select(
  {
    name: 'letter',
    type: 'select',
    message: 'Select your favorite letter',
    useNumbers: true,
    choices: [
      { message: 'A', value: 'a' },
      { message: 'B', value: 'b' },
      { message: 'C', value: 'c' },
    ],
    // ...listFormatters,
  },
);
const result2 = await ask.checkbox(
  {
    name: 'colors',
    type: 'checkbox',
    message: 'Select your favorite colors',
    choices: [
      { message: 'Red', value: 'red' },
      { message: 'Green', value: 'green' },
      { message: 'Blue', value: 'blue' },
    ],
    defaultValues: ['green', 'blue'],
    // ...listFormatters,
  },
);

const result3 = await ask.checkbox({
  name: 'day',
  type: 'checkbox',
  message: 'Select the days of the week',
  columns: 3,
  choices: [
    { message: 'Monday', value: 'mon' },
    { message: 'Tuesday', value: 'tue' },
    { message: 'Wednesday', value: 'wed' },
    { message: 'Thursday', value: 'thu' },
    { message: 'Friday', value: 'fri' },
    { message: 'Saturday', value: 'sat' },
    { message: 'Sunday', value: 'sun' },
  ],
});

console.log('--------------------');
console.log(result);
console.log(result2);
console.log(result3);

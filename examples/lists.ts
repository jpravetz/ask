import * as Ask from '../mod.ts';

const ask = new Ask.Main({ prefix: '', suffix: ':', indent: 'weird indent > ' });

const result = await ask.select(
  {
    name: 'letter',
    type: 'select',
    message: 'Select your favorite letter (numbers enabled)',
    useNumbers: true,
    choices: [
      { message: 'A', value: 'a' },
      { message: 'B', value: 'b' },
      { message: 'C', value: 'c' },
    ],
    // ...listFormatters,
  },
);
const result1 = await ask.select(
  {
    name: 'letter',
    type: 'select',
    message: 'Select your favorite letter (numbers disabled)',
    useNumbers: false,
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
console.log(result1);
console.log(result2);
console.log(result3);

const result4 = await ask.select(
  {
    name: 'animal',
    type: 'select',
    message: 'Select your favorite animal',
    choices: [
      { message: 'Dog', value: 'dog' },
      { message: 'Cat', value: 'cat' },
      { message: 'Bird', value: 'bird' },
    ],
  },
);
console.log(result4);

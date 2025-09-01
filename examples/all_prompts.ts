import * as Ask from '../mod.ts';

const ask = new Ask.Ask({ prefix: '', indent: 15 });

// Select prompt example
const letterResult = await ask.select(
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
  },
);

// Checkbox prompt example
const dayResult = await ask.checkbox({
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

// Input prompt example
const nameResult = await ask.input({
  name: 'name',
  message: 'What is your name?',
  default: 'John Doe',
});

// Confirm prompt example
const confirmResult = await ask.confirm({
  name: 'confirm',
  message: 'Are you sure?',
  default: true,
});

// Number prompt example
const ageResult = await ask.number({
  name: 'age',
  message: 'How old are you?',
  default: 30,
  validate: (value) => value > 0,
});

// Password prompt example
const passwordResult = await ask.password({
  name: 'password',
  message: 'Enter your password',
});

console.log(letterResult);
console.log(dayResult);
console.log(nameResult);
console.log(confirmResult);
console.log(ageResult);
console.log(passwordResult);

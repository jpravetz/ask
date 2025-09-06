import * as Ask from '../mod.ts';

const ask = new Ask.Main({ prefix: '', suffix: ':', indent: 8 });

try {
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
  const results = await ask.prompt([
    {
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
    },

    // Input prompt example
    {
      name: 'name',
      type: 'input',
      message: 'What is your name',
      default: 'John Doe',
    },

    // Confirm prompt example
    {
      name: 'confirm',
      type: 'confirm',
      message: 'Are you sure?',
      default: true,
    },

    // Number prompt example
    {
      name: 'age',
      type: 'number',
      message: 'How old are you?',
      default: 30,
      validate: (value) => typeof value === 'number' && value > 0,
    },

    // Inline checkbox prompt example
    {
      name: 'days',
      type: 'inlineCheckbox',
      message: 'Do you want me to come on',
      suffix: 'to water the plants?',
      choices: [
        { message: 'Mondays', value: 'mon' },
        { message: 'Tuesdays', value: 'tue' },
        { message: 'Wednesdays', value: 'wed' },
      ],
    },
  ]);

  // Password prompt example
  const passwordResult = await ask.password({
    name: 'password',
    message: 'Enter your password',
  });

  console.log(letterResult);
  console.log(results);
  console.log(passwordResult);
} catch (err) {
  console.log(err instanceof Error ? err.message : err);
}

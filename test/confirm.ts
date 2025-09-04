import * as Ask from '../mod.ts';

const ask = new Ask.Main({ prefix: '', suffix: ':', indent: 8 });

try {
  // const name = await ask.input(
  //   {
  //     name: 'name',
  //     type: 'input',
  //     message: 'What is your name?',
  //     default: 'John Doe',
  //   },
  // );
  const name2 = await ask.confirm(
    {
      name: 'confirm',
      type: 'confirm',
      message: 'Are you sure?',
      default: false,
    },
  );
  const name3 = await ask.input(
    {
      name: 'name',
      type: 'input',
      message: 'What is your spouse name?',
      default: 'Jane DOe',
    },
  );

  // // Checkbox prompt example
  // const results = await ask.prompt([
  //   // Input prompt example
  //   {
  //     name: 'name',
  //     type: 'input',
  //     message: 'What is your name?',
  //     default: 'John Doe',
  //   },

  //   // Confirm prompt example
  //   {
  //     name: 'confirm',
  //     type: 'confirm',
  //     message: 'Are you sure?',
  //     default: true,
  //   },

  //   // Number prompt example
  //   {
  //     name: 'age',
  //     type: 'number',
  //     message: 'How old are you?',
  //     default: 30,
  //     validate: (value) => typeof value === 'number' && value > 0,
  //   },
  // ]);

  // // Password prompt example
  // const passwordResult = await ask.password({
  //   name: 'password',
  //   message: 'Enter your password',
  // });

  console.log(name);
  // console.log(results);
  // console.log(passwordResult);
} catch (err) {
  console.log(err instanceof Error ? err.message : err);
}

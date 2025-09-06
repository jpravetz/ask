import * as Ask from '../mod.ts';

const ask = new Ask.Main({ prefix: '', suffix: ':', indent: 8 });

try {
  const name = await ask.input(
    {
      name: 'name',
      type: 'input',
      message: 'What is your name?',
      default: 'John Doe',
    },
  );
  const confirm = await ask.confirm(
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

  console.log(name);
  console.log(confirm);
  console.log(name3);
  // console.log(results);
  // console.log(passwordResult);
} catch (err) {
  console.log(err instanceof Error ? err.message : err);
}

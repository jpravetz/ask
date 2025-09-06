import * as Ask from '../mod.ts';

const ask = new Ask.Main({ prefix: '', suffix: ':', indent: 8 });

try {
  const confirm = await ask.confirm(
    {
      name: 'confirm',
      type: 'confirm',
      message: 'Are you sure?',
      default: false,
    },
  );
  const input = await ask.input(
    {
      name: 'name',
      type: 'input',
      message: 'What is your spouse name?',
      default: 'Jane DOe',
    },
  );

  console.log(confirm);
  console.log(input);
} catch (err) {
  console.log(err instanceof Error ? err.message : err);
}

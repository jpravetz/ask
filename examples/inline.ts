import * as Ask from '../mod.ts';

const ask = new Ask.Main({ prefix: '', suffix: ':', indent: 8 });

try {
  const result = await ask.inlineCheckbox({
    name: 'days',
    message: 'Do you want me to come on',
    suffix: 'to water the plants?',
    choices: [
      { message: 'Mondays', value: 'mon' },
      { message: 'Tuesdays', value: 'tue' },
      { message: 'Wednesdays', value: 'wed' },
    ],
    default: ['wed'],
  });

  console.log(result);
} catch (err) {
  console.log(err instanceof Error ? err.message : err);
}

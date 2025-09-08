import * as colors from '@std/fmt/colors';

export class Fmt {
  static checkbox = {
    prefix: { selected: colors.cyan('● '), unselected: '○ ' },
  };
  static inlineCheckbox = {
    prefix: {
      selected: colors.green('● '),
      unselected: colors.gray('○ '),
      finalSelected: colors.green('● '),
      finalUnselected: colors.gray('○ '),
    },
    active: (message: string) => colors.underline(message),
    inactive: (message: string) => message,
    selected: (message: string) => colors.green(message),
    unselected: (message: string) => colors.gray(message),
    finalSelected: (message: string) => colors.green(message),
    finalUnselected: (message: string) => colors.strikethrough(colors.gray(message)),
  };
  static questionPrefix = colors.green('?');
  static errorPrefix = colors.red('>>');
  static yes = colors.green('Yes');
  static no = colors.red('No');

  static answer(s: string): string {
    return colors.green(s);
  }
  static edit(s: string): string {
    return colors.cyan(s);
  }
  static question(s: string, final = false): string {
    return colors.white(final ? s : colors.bold(s));
  }

  static inactive(message: string): string {
    return `  ${message}`;
  }

  static active(message: string): string {
    return colors.cyan(`❯ ${message}`);
  }

  static disabled(message: string): string {
    return colors.gray(`- ${message} (disabled)`);
  }
}

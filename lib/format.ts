import * as colors from '@std/fmt/colors';

export class Fmt {
  static checkbox = {
    selected: colors.cyan('● '),
    unselected: '○ ',
  };
  static questionPrefix = colors.green('?');
  static errorPrefix = colors.red('>>');
  static yes = colors.green('Yes');
  static no = colors.red('No');

  static answer(s: string): string {
    return colors.green(s);
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

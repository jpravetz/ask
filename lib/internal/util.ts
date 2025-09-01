const ANSI_REGEX = new RegExp(
  [
    '[\\x1B\\x9B]', // ESC and CSI
    '[\\[\\]()#;?]*', // sequence characters
    '(?:', // start group
    '(?:', // sub-group
    '(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?', // parameters
    '\\x07', // BEL character
    ')', // end sub-group
    '|', // OR
    '(?:', // sub-group
    '(?:\\d{1,4}(?:;\\d{0,4})*)?', // numbers
    '[\\dA-PR-TZcf-ntqry=><~]', // final character
    ')', // end sub-group
    ')', // end group
  ].join(''),
  'g',
);

export function stripAnsiCodes(str: string): string {
  return str.replace(ANSI_REGEX, '');
}

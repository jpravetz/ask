const ansiRegex = new RegExp(
  /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/,
  "g",
);

export function stripAnsiCodes(str: string): string {
  return str.replace(ansiRegex, "");
}

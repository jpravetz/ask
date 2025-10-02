import { EndOfFileError, InterruptedError } from '$errors';
import { Fmt } from '$fmt';
import * as colors from '@std/fmt/colors';
import type * as IO from './types.ts';

const REG = {
  // deno-lint-ignore no-control-regex
  toVisible: new RegExp(/\x1b\[[0-9;]*[a-zA-Z]/g),
};
function getVisibleLength(str: string): number {
  // Strips ANSI escape codes to calculate visible length
  return str.replace(REG.toVisible, '').length;
}

export async function readLine(
  {
    input,
    output,
    hidden,
    mask,
    defaultValue,
    onCtrlR,
    getPrompt,
  }: IO.ReadlineOpts,
): Promise<string | undefined> {
  let isRaw = false;
  if (input === Deno.stdin) {
    isRaw = true;
    try {
      (input as typeof Deno.stdin).setRaw(true);
    } catch {
      // setRaw will fail if not a TTY
      isRaw = false;
    }
  }

  let inputStr = defaultValue ?? '';
  if (inputStr.length > 0) {
    if (!hidden) {
      await output.write(Fmt.edit(inputStr));
    } else if (mask) {
      await output.write(mask.repeat(inputStr.length));
    }
  }
  let pos = inputStr.length;
  const decoder = new TextDecoder();

  const onEnd = (): Promise<void> => {
    if (isRaw) {
      (input as typeof Deno.stdin).setRaw(false);
    }
    return Promise.resolve();
  };
  let ctrlCPressed = false;
  let timer;

  try {
    while (true) {
      const data = new Uint8Array(8);
      const n = await input.read(data);

      if (!n) {
        throw new EndOfFileError('Input stream closed unexpectedly.');
      }

      const char = decoder.decode(data.slice(0, n));

      switch (char) {
        case '\u0001': // Ctrl+A (start of line)
          if (pos > 0) {
            await output.write(Fmt.cursorBackward(pos));
            pos = 0;
          }
          break;

        case '\u0005': // Ctrl+E (end of line)
          if (pos < inputStr.length) {
            await output.write(Fmt.cursorForward(inputStr.length - pos));
            pos = inputStr.length;
          }
          break;

        case '\u0004': // EOT - ctrl+d
          throw new EndOfFileError();

        case '\u0012': { // Ctrl+R
          if (onCtrlR && getPrompt) {
            const fullPromptLine = getPrompt();
            const prefixIndex = fullPromptLine.search(/\S/);

            if (prefixIndex !== -1) {
              const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
              let i = 0;
              let spinning = true;

              const getDisplayedInput = () => {
                if (!hidden) {
                  return Fmt.edit(inputStr);
                }
                if (mask) {
                  return mask.repeat(inputStr.length);
                }
                return '';
              };

              const spin = async () => {
                await output.hideCursor();
                const spaceAfterPrefixIndex = fullPromptLine.indexOf(' ', prefixIndex);
                const indentPart = fullPromptLine.substring(0, prefixIndex);
                const messagePart = fullPromptLine.substring(spaceAfterPrefixIndex);

                while (spinning) {
                  const frame = Fmt.question(spinner[(i = ++i % spinner.length)]);
                  const newPrompt = indentPart + frame + messagePart;
                  await output.gotoBeginningOfLine();
                  await output.write(newPrompt + getDisplayedInput());
                  await output.write('\x1b[K'); // Clear to end of line

                  // Reposition cursor for consistency with other redraw logic
                  await output.gotoBeginningOfLine();
                  await output.write(Fmt.cursorForward(getVisibleLength(newPrompt) + pos));

                  await new Promise((resolve) => setTimeout(resolve, 80));
                }
                await output.showCursor();
              };

              const spinPromise = spin();
              let result: boolean | void | undefined = undefined;

              try {
                result = await onCtrlR();
              } finally {
                spinning = false;
                await spinPromise;

                const spaceAfterPrefixIndex = fullPromptLine.indexOf(' ', prefixIndex);
                const indentPart = fullPromptLine.substring(0, prefixIndex);
                const messagePart = fullPromptLine.substring(spaceAfterPrefixIndex);

                let finalPrompt;

                if (result === true) {
                  const finalPrefix = colors.green('●');
                  finalPrompt = indentPart + finalPrefix + messagePart;
                } else if (result === false) {
                  const finalPrefix = colors.red('●');
                  finalPrompt = indentPart + finalPrefix + messagePart;
                } else {
                  finalPrompt = fullPromptLine;
                }

                await output.gotoBeginningOfLine();
                await output.write(finalPrompt + getDisplayedInput());
                await output.write('\x1b[K'); // Clear to end of line
              }
            } else {
              await onCtrlR();
            }
          } else if (onCtrlR) {
            await onCtrlR();
          }
          break;
        }

        case '\u0003': // ETX
          if (ctrlCPressed) {
            clearTimeout(timer);
            throw new EndOfFileError('Terminated by user');
          }
          ctrlCPressed = true;
          timer = setTimeout(() => ctrlCPressed = false, 400);
          break;

        case '\r': // CR - return
        case '\n': // LF - return
          return inputStr;

        case '\u0008': // BS - backspace
        case '\u007f': // DEL - backspace
          if (pos > 0) {
            inputStr = inputStr.slice(0, pos - 1) + inputStr.slice(pos);
            pos--;
            if (!hidden) {
              const rest = inputStr.slice(pos);
              await output.write('\b' + Fmt.edit(rest) + ' ' + '\b'.repeat(rest.length + 1));
            } else if (mask) {
              await output.write('\b \b');
            }
          }
          break;

        case '\u001b[A': // Up arrow
        case '\u001b[B': // Down arrow
          // Do nothing
          break;

        case '\u001b[C': // Right arrow
          if (pos < inputStr.length) {
            await output.write(Fmt.cursorForward(1));
            pos++;
          }
          break;

        case '\u001b[D': // Left arrow
          if (pos > 0) {
            await output.write(Fmt.cursorBackward(1));
            pos--;
          }
          break;

        case '\u001b[1;5C': // Ctrl+Right
        case '\u001b\u0066': { // Opt+Right
          const oldPos = pos;
          const endOfWord = inputStr.slice(pos).search(/\s/);
          if (endOfWord !== -1) {
            pos += endOfWord + 1;
          } else {
            pos = inputStr.length;
          }
          await output.write(Fmt.cursorForward(pos - oldPos));
          break;
        }
        case '\u001b[1;5D': // Ctrl+Left
        case '\u001b\u0062': { // Opt+Left
          const oldPos = pos;
          const lastSpace = inputStr.slice(0, pos).lastIndexOf(' ');
          if (lastSpace !== -1) {
            pos = lastSpace;
          } else {
            pos = 0;
          }
          await output.write(Fmt.cursorBackward(oldPos - pos));
          break;
        }

        case '\u001b': { // ESC
          throw new InterruptedError();
        }

        default: {
            // Filter out control characters and newlines from the input string
            let printableChars = '';
            for (const c of char) {
              const charCode = c.charCodeAt(0);
              // Allow printable characters (e.g., ASCII 32-126, and other Unicode printable chars)
              // Exclude control characters (0-31, 127) and newlines
              if (charCode >= 32 && charCode !== 127 && c !== '\n' && c !== '\r') {
                printableChars += c;
              }
            }

            if (printableChars.length > 0) {
              // Enforce 120 character limit
              const newLength = inputStr.length + printableChars.length;
              if (newLength > 120) {
                printableChars = printableChars.slice(0, 120 - inputStr.length);
                if (printableChars.length === 0) {
                  // If no characters can be added, just break
                  break;
                }
              }

              inputStr = inputStr.slice(0, pos) + printableChars + inputStr.slice(pos);
              pos += printableChars.length; // Correctly increment pos by the length of the inserted string
              if (!hidden) {
                await output.gotoBeginningOfLine();
                const prompt = getPrompt ? getPrompt() : '';
                await output.write(prompt + Fmt.edit(inputStr)); // Redraw entire line
                await output.write('\x1b[K'); // Clear to end of line

                // Move cursor to the beginning of the line
                await output.gotoBeginningOfLine();
                // Move cursor forward to the desired position
                await output.write(Fmt.cursorForward(getVisibleLength(prompt) + pos));
              } else if (mask) {
                await output.write(mask.repeat(printableChars.length));
              }
            }
          }
          break;
      }
    }
  } catch (error) {
    await onEnd();
    throw error;
  } finally {
    await onEnd();
  }
}
import { EndOfFileError, InterruptedError } from '$errors';
import { Fmt } from '$fmt';
import type * as IO from './types.ts';

export async function readLine({
  input,
  output,
  hidden,
  mask,
  defaultValue,
}: IO.ReadlineOpts): Promise<string | undefined> {
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
  if (inputStr.length > 0 && !hidden) {
    await output.write(Fmt.edit(inputStr));
  }
  let pos = inputStr.length;
  const decoder = new TextDecoder();

  const onEnd = (): Promise<void> => {
    if (isRaw) {
      (input as typeof Deno.stdin).setRaw(false);
      // if (hidden || mask) {
      //   await output.newLine();
      // }
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

        case '\u001b': { // ESC
          throw new InterruptedError();
        }

        default:
          // Ignore other control characters
          if (char.charCodeAt(0) >= 32) {
            inputStr = inputStr.slice(0, pos) + char + inputStr.slice(pos);
            pos++;
            if (!hidden) {
              if (mask) {
                await output.write(Fmt.edit(mask));
              } else {
                const rest = inputStr.slice(pos);
                await output.write(Fmt.edit(char + rest) + '\b'.repeat(rest.length));
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
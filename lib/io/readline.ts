import { EndOfFileError, InterruptedError } from '../errors.ts';
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
    await output.write(inputStr);
  }
  let pos = inputStr.length;
  const decoder = new TextDecoder();

  try {
    while (true) {
      const data = new Uint8Array(1);
      const n = await input.read(data);

      if (!n) {
        throw new EndOfFileError('Input stream closed unexpectedly.');
      }

      const char = decoder.decode(data.slice(0, n));

      switch (char) {
        case '\u0001': // Ctrl+A (start of line)
          pos = 0;
          // No visual update for Ctrl-A in this version
          break;

        case '\u0005': // Ctrl+E (end of line)
          pos = inputStr.length;
          // No visual update for Ctrl-E in this version
          break;

        case '\u0003': // ETX - ctrl+c
          throw new InterruptedError();

        case '\u0004': // EOT - ctrl+d
          throw new EndOfFileError();

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
              await output.write('\b' + rest + ' ' + '\b'.repeat(rest.length + 1));
            }
          }
          break;

        case '\u001b': { // ESC
          // check for arrow keys
          const arrow = new Uint8Array(2);
          const arrowN = await input.read(arrow);
          if (arrowN === 2 && decoder.decode(arrow) === '[C') { // right
            if (pos < inputStr.length) {
              pos++;
              // No visual update for arrow keys in this version
            }
          } else if (arrowN === 2 && decoder.decode(arrow) === '[D') { // left
            if (pos > 0) {
              pos--;
              // No visual update for arrow keys in this version
            }
          }
          // Other escape sequences are ignored
          break;
        }

        default:
          // Ignore other control characters
          if (char.charCodeAt(0) >= 32) {
            inputStr = inputStr.slice(0, pos) + char + inputStr.slice(pos);
            pos++;
            if (!hidden) {
              if (mask) {
                await output.write(mask);
              } else {
                const rest = inputStr.slice(pos);
                await output.write(char + rest + '\b'.repeat(rest.length));
              }
            }
          }
          break;
      }
    }
  } finally {
    if (isRaw) {
      (input as typeof Deno.stdin).setRaw(false);
      if (hidden || mask) {
        await output.write(new TextEncoder().encode('\n'));
      }
    }
  }
}

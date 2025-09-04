import type * as StdIo from '@std/io';
import { EndOfFileError, InterruptedError } from '../errors.ts';
import type { Writer } from './writer.ts';

export async function readLine({
  input,
  output,
  hidden,
  mask,
  defaultValue,
}: {
  input: StdIo.Reader & StdIo.ReaderSync & StdIo.Closer;
  output: Writer;
  hidden?: boolean;
  mask?: string;
  defaultValue?: string;
}): Promise<string | undefined> {
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
  let currentCursorPos = inputStr.length;
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // Initial display of the default value
  if (!hidden) {
    await output.write(encoder.encode(inputStr));
    // await output.write(inputStr);
  }

  try {
    while (true) {
      const buffer = new Uint8Array(100); // Read a larger buffer
      const n = await input.read(buffer);

      if (!n) {
        throw new EndOfFileError('Input stream closed unexpectedly.');
      }

      const char = decoder.decode(buffer.slice(0, n));

      // Clear current line and redraw
      const redraw = async () => {
        if (hidden) return;
        // Move cursor to beginning of line, clear from cursor to end, then write input string
        await output.write(
          encoder.encode('\x1b[1G\x1b[0K' + (mask ? mask.repeat(inputStr.length) : inputStr)),
        );
        // Move cursor to current position
        await output.write(encoder.encode(`\x1b[${currentCursorPos + 1}G`));
      };

      switch (char) {
        case '\u0003': // ETX - ctrl+c
          throw new InterruptedError();

        case '\u0004': // EOT - ctrl+d
          throw new EndOfFileError();

        case '\r': // CR - return
        case '\n': // LF - return
          return inputStr;

        case '\u001b': { // ESC or Arrow Keys
          if (n > 1) { // Likely an escape sequence (e.g., arrow keys)
            const sequence = decoder.decode(buffer.slice(1, n));
            if (sequence === '[A') { // Up arrow
              // Do nothing for now, or implement history
            } else if (sequence === '[B') { // Down arrow
              // Do nothing for now, or implement history
            } else if (sequence === '[C') { // Right arrow
              if (currentCursorPos < inputStr.length) {
                currentCursorPos++;
                await output.write(encoder.encode('\x1b[1C')); // Move cursor right
              }
            } else if (sequence === '[D') { // Left arrow
              if (currentCursorPos > 0) {
                currentCursorPos--;
                await output.write(encoder.encode('\x1b[1D')); // Move cursor left
              }
            }
          } else { // Just ESC key
            return undefined; // As per GEMINI.md
          }
          break;
        }

        case '\u007f': // DEL - backspace
        case '\u0008': // BS - backspace
          if (currentCursorPos > 0) {
            inputStr = inputStr.slice(0, currentCursorPos - 1) + inputStr.slice(currentCursorPos);
            currentCursorPos--;
            await redraw();
          }
          break;

        default:
          // Only process printable characters
          if (char.length === 1 && char.charCodeAt(0) >= 32) {
            inputStr = inputStr.slice(0, currentCursorPos) + char + inputStr.slice(currentCursorPos);
            currentCursorPos++;
            await redraw();
          }
          break;
      }
    }
  } finally {
    if (isRaw) {
      (input as typeof Deno.stdin).setRaw(false);
      // Ensure cursor is at the end of the line after input
      await output.write(encoder.encode('\n'));
    }
  }
}

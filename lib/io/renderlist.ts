import { stripAnsiCodes } from '$io';
import type * as Item from '$item';
import type { Closer, Reader, ReaderSync, Writer, WriterSync } from '@std/io';

export async function renderList({
  input,
  output,
  items,

  onEnter,
  onSpace,
  onDown,
  onUp,
  onLeft,
  onRight,
  onNumber,
  columns = 1,
  indent = '',
}: {
  input: Reader & ReaderSync & Closer;
  output: Writer & WriterSync & Closer;
  items: Item.List[];
  columns?: number;

  onEnter: () => void;
  onSpace?: () => void;
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
  onNumber?: (n: number) => void;
  indent?: string;
}): Promise<number> {
  const longestItem = items.reduce((longest, item) => {
    const len = stripAnsiCodes(item.message).length;
    return len > longest ? len : longest;
  }, 0);
  const columnWidth = longestItem + 4; // 4 spaces for padding

  const rows = Math.ceil(items.length / columns);

  for (let i = 0; i < rows; i++) {
    let rowStr = '';
    for (let j = 0; j < columns; j++) {
      const itemIndex = i * columns + j;
      if (itemIndex < items.length) {
        const item = items[itemIndex];
        const formattedItem = item.format();
        const formattedLength = stripAnsiCodes(formattedItem).length;
        const padding = columnWidth - formattedLength;
        rowStr += formattedItem + ' '.repeat(Math.max(0, padding));
      }
    }
    await output.write(new TextEncoder().encode(indent + rowStr + '\n'));
  }

  const data = new Uint8Array(3);
  const n = await input.read(data);

  if (!n) {
    return -1;
  }

  const str = new TextDecoder().decode(data.slice(0, n));

  switch (str) {
    case '\u0003': // ETX
    case '\u0004': // EOT
    case '\u001b': // ESC
      throw new Error('Terminated by user.');

    case '\r': // CR
    case '\n': // LF
      onEnter();
      break;

    case '\u0020': // SPACE
      if (onSpace) {
        onSpace();
      }
      break;

    case '\u001b[A': // UP
      onUp();
      break;

    case '\u001b[B': // DOWN
      onDown();
      break;

    case '\u001b[D': // left
      onLeft();
      break;

    case '\u001b[C': // right
      onRight();
      break;

    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
      if (onNumber) {
        onNumber(parseInt(str, 10));
      }
      break;
  }

  // clear list to rerender it
  for (let i = 0; i < rows; i++) {
    // go to beginning of line
    await output.write(new TextEncoder().encode('\r'));
    // clear line
    await output.write(new TextEncoder().encode('\x1b[K'));
    // go up
    await output.write(new TextEncoder().encode('\x1b[A'));
  }

  return rows;
}

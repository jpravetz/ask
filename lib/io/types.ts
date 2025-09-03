import type * as Item from '$item';
import type * as StdIo from '@std/io';
import type { Writer } from './writer.ts';

export type RenderListOpts = {
  input: StdIo.Reader & StdIo.ReaderSync & StdIo.Closer;
  output: Writer;
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
};

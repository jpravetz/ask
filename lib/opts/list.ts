import type { Choice } from '$types';
import type { PromptOpts } from './prompt.ts';

export type ListOpts = PromptOpts<unknown> & {
  choices: Choice[];
  multiple?: boolean;
  selectedPrefix?: string;
  unselectedPrefix?: string;
  inactiveFormatter?: (message: string) => string;
  activeFormatter?: (message: string) => string;
  disabledFormatter?: (message: string) => string;
  useNumbers?: boolean;
  columns?: number;
  defaultValues?: string[];
};

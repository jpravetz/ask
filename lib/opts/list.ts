import type { Choice } from '$types';
import type { PromptOpts } from './prompt.ts';

export type ListOpts = PromptOpts<unknown> & {
  choices: Choice[];
  multiple?: boolean;
  selectedPrefix?: string;
  unselectedPrefix?: string;
  inactiveFormatter?: (message: string, selected: boolean) => string;
  activeFormatter?: (message: string, selected: boolean) => string;
  disabledFormatter?: (message: string, selected: boolean) => string;
  useNumbers?: boolean;
  columns?: number;
  defaultValues?: string[];
};

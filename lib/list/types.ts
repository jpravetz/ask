/**
 * A single item in a list.
 */
export interface ItemOpts {
  message: string;
  value?: unknown;
  disabled?: boolean;
  selected?: boolean;
  active?: boolean;
  selectedPrefix?: string;
  unselectedPrefix?: string;
  inactiveFormatter?: (message: string, selected: boolean) => string;
  activeFormatter?: (message: string, selected: boolean) => string;
  disabledFormatter?: (message: string, selected: boolean) => string;
}

export type SelectOptions<T = string> = Array<{
  text: string;
  value: T;
  disabled?: boolean;
  key?: string | number;
}>;

export interface SpellManageAction {
  action: 'add' | 'remove';
  spellId: string;
}

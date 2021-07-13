import { Alignment } from '../types/core';
import { SelectOptions } from '../types/misc';

export const alignmentTranslates: Record<Alignment, string> = {
  [Alignment.LG]: '守序善良',
  [Alignment.LN]: '守序中立',
  [Alignment.LE]: '守序邪恶',
  [Alignment.NG]: '中立善良',
  [Alignment.N]: '绝对中立',
  [Alignment.NE]: '中立邪恶',
  [Alignment.CG]: '混乱善良',
  [Alignment.CN]: '混乱中立',
  [Alignment.CE]: '混乱邪恶',
};

export const alignmentOptions: SelectOptions<Alignment> = Object.entries(alignmentTranslates).map(
  ([value, text]) => ({ value: value as Alignment, text })
);

export function constraintAppliedAlignmentOptions(
  constraint: Alignment[]
): SelectOptions<Alignment> {
  return alignmentOptions.map((o) => {
    const disabled = constraint.length !== 0 && !constraint.includes(o.value);

    return { ...o, disabled };
  });
}

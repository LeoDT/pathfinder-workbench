import { useMemo } from 'react';

import { useStore } from '../store';
import { EffectGainBloodlineInput } from '../types/effectType';
import CollectionEntityPicker from './CollectionEntityPicker';

interface Props {
  value: EffectGainBloodlineInput | null;
  onChange: (v: EffectGainBloodlineInput) => void;
  type: 'Sorcerer' | 'BloodRager';
}

export function BloodlinePicker({ value, onChange, type = 'Sorcerer' }: Props): JSX.Element {
  const { collections } = useStore();
  const collection = useMemo(() => {
    return collections.sorcererBloodline;
  }, [type]);
  const pickerItems = useMemo(() => (value ? [value.bloodline] : []), [value]);

  return (
    <CollectionEntityPicker
      collection={collection}
      items={pickerItems}
      onPick={(v: string) => onChange({ bloodline: v })}
      listAll
    />
  );
}

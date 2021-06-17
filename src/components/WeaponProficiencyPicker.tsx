import { useCallback, useMemo } from 'react';

import { useStore } from '../store';
import { WeaponTraining } from '../types/core';
import EntityPicker from './EntityPicker';

interface Props {
  value: string | null;
  onChange: (v: string | null) => void;
  training: WeaponTraining[];
  had?: string[];
}

export function WeaponProficiencyPicker({ value, onChange, training, had }: Props): JSX.Element {
  const { collections } = useStore();
  const weapons = useMemo(
    () => collections.weaponType.data.filter((w) => training.includes(w.meta.training)),
    [training, had]
  );
  const items = useMemo(() => (value ? [value] : []), [value]);
  const onPick = useCallback(
    (v) => {
      onChange(v);
    },
    [items, onChange]
  );
  const onUnpick = useCallback(() => {
    onChange(null);
  }, [items, onChange]);

  return (
    <EntityPicker
      entities={weapons}
      disabledEntityIds={had}
      items={items}
      onPick={onPick}
      onUnpick={onUnpick}
    />
  );
}

import { useStore } from '../store';
import { EffectNeadInput, EffectType } from '../types/effectType';
import SimpleEntity from './SimpleEntity';

interface Props {
  input: unknown;
  effect: EffectNeadInput;
}

export function EffectInputDisplayer({ input, effect }: Props): JSX.Element | null {
  const { collections } = useStore();
  let child = null;

  if (!input) return null;

  switch (effect.type) {
    case EffectType.gainSelectedWeaponProficiency:
      {
        if (typeof input !== 'string') return null;

        const weaponType = collections.weaponType.getById(input);

        child = <SimpleEntity entity={weaponType} />;
      }
      break;

    default:
      break;
  }

  return child;
}

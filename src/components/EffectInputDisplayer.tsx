import { HStack, Badge } from '@chakra-ui/react';

import { useStore } from '../store';
import { EffectNeadInput, EffectType } from '../types/effectType';
import { validateGainArcaneSchoolEffectInput } from '../utils/effect';
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
    case EffectType.gainArcaneSchool:
      {
        const realInput = validateGainArcaneSchoolEffectInput(input);

        const school = collections.arcaneSchool.getById(realInput.school);
        const forbidden = realInput.forbiddenSchool.map((s) => collections.arcaneSchool.getById(s));
        const focused =
          school.type === 'standard' && realInput.focused
            ? school.focused.find((f) => f.id === realInput.focused)
            : undefined;

        child = (
          <HStack>
            <Badge fontSize="md" colorScheme="blue">
              {focused ? `${focused.name}(${school.name})` : school.name}
            </Badge>
            {forbidden.map((s) => (
              <Badge fontSize="md" key={s.id} colorScheme="red">
                {s.name}
              </Badge>
            ))}
          </HStack>
        );
      }
      break;

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

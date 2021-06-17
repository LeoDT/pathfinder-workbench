import { Badge, HStack } from '@chakra-ui/react';

import { useStore } from '../store';
import { EffectNeedInput, EffectType } from '../types/effectType';
import {
  validateGainArcaneSchoolEffectInput,
  validateGainBloodlineEffectInput,
  validateGainSkillEffectInput,
} from '../utils/effect';
import SimpleEntity, { SimpleEntityBadge } from './SimpleEntity';

interface Props {
  input: unknown;
  effect: EffectNeedInput;
}

export function EffectInputDisplayer({ input, effect }: Props): JSX.Element | null {
  const { collections } = useStore();
  let child = null;

  if (!input) return null;

  switch (effect.type) {
    case EffectType.gainSkill:
      {
        const realInput = validateGainSkillEffectInput(input);

        const skill = collections.coreSkill.getById(realInput);

        child = <SimpleEntityBadge entity={skill} />;
      }
      break;

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

    case EffectType.gainBloodline:
      {
        const realInput = validateGainBloodlineEffectInput(input);

        const bloodline = collections.sorcererBloodline.getById(realInput.bloodline);

        child = <SimpleEntityBadge entity={bloodline} />;
      }
      break;

    default:
      break;
  }

  return child;
}

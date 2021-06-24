import { Badge, HStack } from '@chakra-ui/react';

import { useStore } from '../store';
import { Entity, SpecialFeat } from '../types/core';
import { EffectNeedInput, EffectType } from '../types/effectType';
import {
  validateGainArcaneSchoolEffectInput,
  validateGainBloodlineEffectInput,
  validateGainSkillEffectInput,
  validateSelectFromSubsEffectInput,
} from '../utils/effect';
import SimpleEntity, { SimpleEntityBadge } from './SimpleEntity';

interface Props {
  input: unknown;
  effect: EffectNeedInput;
  source?: Entity;
}

export function EffectInputDisplayer({ input, effect, source }: Props): JSX.Element | null {
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

    case EffectType.selectFromSubs:
      {
        const realInput = validateSelectFromSubsEffectInput(input);
        const realSource = source as SpecialFeat;

        if (!realSource || !realSource.subs) {
          throw new Error('need effect source to display effect `selectFromSubs`.');
        }

        const { subs } = realSource;
        const items: Array<SpecialFeat> = [];

        realInput.forEach((i) => {
          const all = items.length > 0 ? items.slice(-1)[0]?.subs : subs;

          if (!all) {
            throw new Error(`can not show effect input: "${i}" for effect "selectFromSubs"`);
          }

          const hit = all.find((s) => s.id === i);

          if (hit) {
            items.push(hit);
          }
        });

        child =
          items.length > 1 ? (
            <HStack>
              {items.map((s) => (
                <SimpleEntityBadge key={s.id} entity={s} quickViewer />
              ))}
            </HStack>
          ) : (
            <SimpleEntityBadge entity={items[0]} quickViewer />
          );
      }
      break;

    default:
      break;
  }

  return child;
}

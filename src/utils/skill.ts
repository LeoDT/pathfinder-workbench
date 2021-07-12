import { collections } from '../store/collection';
import { Skill } from '../types/core';
import { ABILITY_TYPES } from './ability';

export function coreToConsolidated(skill: Skill): Skill {
  const hit = collections.consolidatedSkill.data.find((s) => s.core?.find((id) => id === skill.id));

  if (hit) {
    return hit;
  }

  throw new Error(`no consolidated skill for skill ${skill.id}`);
}

export function sortedSkills(skills: Skill[]): Skill[] {
  const collator = new Intl.Collator(navigator.language || 'zh-CN');

  const data = [...skills].sort((a, b) => {
    if (a.ability === b.ability) {
      return collator.compare(a.name, b.name);
    }

    return ABILITY_TYPES.indexOf(a.ability) > ABILITY_TYPES.indexOf(b.ability) ? 1 : -1;
  });

  return data;
}

import { collections } from '../store/collection';
import { Skill } from '../types/core';

export function coreToConsolidated(skill: Skill): Skill {
  const hit = collections.consolidatedSkill.data.find((s) => s.core?.find((id) => id === skill.id));

  if (hit) {
    return hit;
  }

  throw new Error(`no consolidated skill for skill ${skill.id}`);
}

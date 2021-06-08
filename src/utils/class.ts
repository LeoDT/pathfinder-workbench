import { Class, ClassLevel } from '../types/core';

export function getClassLevel(clas: Class, l: number): ClassLevel {
  const level = clas.levels[l - 1];

  if (level) {
    return level;
  }

  throw new Error(`class ${clas.id} do no have level ${l}`);
}

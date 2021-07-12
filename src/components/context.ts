import { Character } from '../store/character';
import { createContextFailSafe } from '../utils/react';

export const [useOptionalCharacter, OptionalCharacterContext] =
  createContextFailSafe<Character | null>();

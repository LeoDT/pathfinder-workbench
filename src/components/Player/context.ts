import { Character } from '../../store/character';
import { createContextNoNullCheck } from '../../utils/react';

export const [useCurrentCharacter, CurrentCharacterContext] = createContextNoNullCheck<Character>();

export const [useHistoryUnblock, HistoryUnblockContext] = createContextNoNullCheck<{
  current: null | (() => void);
}>();

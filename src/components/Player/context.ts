import { createContextNoNullCheck } from '../../utils/react';
import Character from '../../store/character';

export const [useCurrentCharacter, CurrentCharacterContext] = createContextNoNullCheck<Character>();

export const [useHistoryUnblock, HistoryUnblockContext] = createContextNoNullCheck<{
  current: null | (() => void);
}>();

import { Box } from '@chakra-ui/react';
import { useState } from 'react';
import { CharacterSpellbook } from '../../store/character/spellbook';
import { SpellbookManagerToggler } from '../SpellbookManager';
import { useCurrentCharacter } from './context';

interface Props {
  spellbook: CharacterSpellbook;
}

export function CharacterDetailSpells({ spellbook }: Props): JSX.Element {
  const character = useCurrentCharacter();
  const [spells] = useState(() => null);

  return (
    <Box position="relative">
      <Box position="absolute" right="0" top="-10">
        <SpellbookManagerToggler spellbook={spellbook} buttonProps={{ size: 'sm' }} />
      </Box>

      <Box />
    </Box>
  );
}

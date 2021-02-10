import { Box, Container } from '@chakra-ui/react';
import { Route } from 'react-router-dom';

import { CurrentCharacterContext } from '../store/character';
import NavLink from '../components/NavLink';
import PlayerSpellBook from '../components/PlayerSpellBook';
import { useState } from 'react';
import { useStore } from '../store';

const SIDEBAR_WIDTH = 140;

export default function PlayerPage(): JSX.Element {
  const store = useStore();
  const [currentCharacter] = useState(() => store.characters[0]);

  return (
    <CurrentCharacterContext.Provider value={currentCharacter}>
      <Container>
        <Box pos="fixed" width={SIDEBAR_WIDTH} borderRight="1px" borderColor="gray.400">
          <Box>
            <NavLink to="/player/spellBook">Spell Book</NavLink>
          </Box>
        </Box>
        <Box pl={SIDEBAR_WIDTH + 20}>
          <Route path="/player/spellbook" component={PlayerSpellBook} />
        </Box>
      </Container>
    </CurrentCharacterContext.Provider>
  );
}

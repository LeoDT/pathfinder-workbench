import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Divider,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { Route, useLocation, Switch, Redirect, useHistory } from 'react-router-dom';

import { useIsSmallerScreen } from '../utils/react';
import { CurrentCharacterContext } from '../store/character';
import { useStore } from '../store';

import CharacterFeats from '../components/CharacterFeats';
import NavLink from '../components/NavLink';
import CharacterSpellbook from '../components/CharacterSpellbook';

const SIDEBAR_WIDTH = 140;

const NAV_LINKS = [
  { text: 'Spellbook', url: '/player/spellbook' },
  { text: 'Feats', url: '/player/feats' },
];

export default function PlayerPage(): JSX.Element {
  const store = useStore();
  const [currentCharacter] = useState(() => store.characters[0]);
  const showMenuNav = useIsSmallerScreen();
  const [currentMenuNavItem, setCurrentMenuNavItem] = useState(NAV_LINKS[0]);
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    const navLink = NAV_LINKS.find(({ url }) => url === location.pathname);

    if (navLink) {
      setCurrentMenuNavItem(navLink);
    }
  }, [location]);

  return (
    <CurrentCharacterContext.Provider value={currentCharacter}>
      <Container>
        {showMenuNav ? (
          <>
            <Menu matchWidth autoSelect={false}>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                variant="outline"
                width="100%"
                colorScheme="blackAlpha"
              >
                {currentMenuNavItem.text}
              </MenuButton>
              <MenuList>
                {NAV_LINKS.map((n) => (
                  <MenuItem
                    key={n.url}
                    onClick={() => {
                      history.push(n.url);
                    }}
                  >
                    <NavLink to={n.url}>{n.text}</NavLink>
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
            <Divider my="2" />
          </>
        ) : (
          <Box pos="fixed" width={SIDEBAR_WIDTH} borderRight="1px" borderColor="gray.400">
            {NAV_LINKS.map((n) => (
              <Box key={n.url}>
                <NavLink to={n.url}>{n.text}</NavLink>
              </Box>
            ))}
          </Box>
        )}
        <Box pl={showMenuNav ? 0 : SIDEBAR_WIDTH + 20}>
          <Switch>
            <Route path="/player/spellbook" component={CharacterSpellbook} />
            <Route path="/player/feats" component={CharacterFeats} />

            <Redirect to="/player/spellbook" />
          </Switch>
        </Box>
      </Container>
    </CurrentCharacterContext.Provider>
  );
}

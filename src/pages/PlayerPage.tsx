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

import NavLink from '../components/NavLink';
import CharacterBasic from '../components/Player/CharacterBasic';
import CharacterSkills from '../components/Player/CharacterSkills';
import CharacterSpellbook from '../components/Player/CharacterSpellbook';

const SIDEBAR_WIDTH = 140;

const NAV_LINKS = [
  { text: '基本', url: '/player/basic' },
  { text: '技能', url: '/player/skills' },
  { text: '法术', url: '/player/spellbook' },
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
      <Container
        display={showMenuNav ? 'block' : 'flex'}
        justifyContent="flex-start"
        alignItems="flex-start"
        pt="4"
      >
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
                    <NavLink to={n.url} fontSize="large">
                      {n.text}
                    </NavLink>
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
            <Divider my="2" />
          </>
        ) : (
          <Box width={SIDEBAR_WIDTH} borderRight="1px" borderColor="gray.400" flexShrink={0}>
            {NAV_LINKS.map((n) => (
              <Box key={n.url}>
                <NavLink to={n.url} fontSize="large">
                  {n.text}
                </NavLink>
              </Box>
            ))}
          </Box>
        )}
        <Box pl={showMenuNav ? '0' : '4'} flexGrow={1}>
          <Switch>
            <Route path="/player/basic" component={CharacterBasic} />
            <Route path="/player/skills" component={CharacterSkills} />
            <Route path="/player/spellbook" component={CharacterSpellbook} />

            <Redirect to="/player/basic" />
          </Switch>
        </Box>
      </Container>
    </CurrentCharacterContext.Provider>
  );
}

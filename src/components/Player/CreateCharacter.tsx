import { useCallback, useEffect, useRef, useState } from 'react';
import { FaChevronLeft } from 'react-icons/fa';
import { Prompt, Redirect, Route, Switch } from 'react-router-dom';

import { Box, Icon } from '@chakra-ui/react';

import CreateCharacterStore, { CreateCharacterStoreContext } from '../../store/createCharacter';
import { HStackNav, HStackNavItem } from '../HStackNav';
import Bread, { useBreadcrumb } from './Bread';
import CharacterBasic from './CreateCharacterBasic';
import CharacterFeat from './CreateCharacterFeat';
import CharacterFinish from './CreateCharacterFinish';
import CharacterSkill from './CreateCharacterSkill';
import CharacterSpell from './CreateCharacterSpell';
import { HistoryUnblockContext } from './context';

export default function CreateCharacter(): JSX.Element {
  const [create] = useState(() => new CreateCharacterStore());
  const historyUnblock = useRef<null | (() => void)>(null);
  const blocking = useRef(true);
  const promptMessage = useCallback(
    (location) => {
      if (location.pathname.includes('create') || !blocking.current) {
        return true;
      }

      return '确定取消新角色吗?';
    },
    [blocking]
  );

  useBreadcrumb('新建角色', '/player/create');

  useEffect(() => {
    historyUnblock.current = () => {
      blocking.current = false;
    };
  }, []);

  return (
    <HistoryUnblockContext.Provider value={historyUnblock}>
      <CreateCharacterStoreContext.Provider value={create}>
        <>
          <Prompt message={promptMessage} />

          <Bread mb="2" />

          <HStackNav mb="6">
            <HStackNavItem
              backgroundColor="red.500"
              color="white"
              borderColor="red.500"
              flexGrow={0}
              to="/player/list"
              _hover={{ textDecoration: 'none', backgroundColor: 'red.600' }}
            >
              <Icon as={FaChevronLeft} color="white" boxSize="1.2rem" />
            </HStackNavItem>
            <HStackNavItem to="/player/create/basic">基础</HStackNavItem>
            <HStackNavItem to="/player/create/skill">技能</HStackNavItem>
            <HStackNavItem to="/player/create/feat">专长</HStackNavItem>
            <HStackNavItem to="/player/create/spell">法术</HStackNavItem>
            <HStackNavItem to="/player/create/finish">完成</HStackNavItem>
          </HStackNav>

          <Box>
            <Switch>
              <Route path="/player/create/basic" component={CharacterBasic} />
              <Route path="/player/create/skill" component={CharacterSkill} />
              <Route path="/player/create/feat" component={CharacterFeat} />
              <Route path="/player/create/spell" component={CharacterSpell} />
              <Route path="/player/create/finish" component={CharacterFinish} />

              <Redirect to="/player/create/basic" />
            </Switch>
          </Box>
        </>
      </CreateCharacterStoreContext.Provider>
    </HistoryUnblockContext.Provider>
  );
}

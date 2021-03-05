import { useState } from 'react';
import { Box, Icon } from '@chakra-ui/react';
import { FaChevronLeft } from 'react-icons/fa';
import { Route, Switch, Redirect } from 'react-router-dom';

import CreateCharacterStore, { CreateCharacterStoreContext } from '../../store/createCharacter';

import { HStackNav, HStackNavItem } from '../HStackNav';
import Bread from './Bread';
import CharacterBasic from './CreateCharacterBasic';
import CharacterSkill from './CreateCharacterSkill';
import CharacterFeat from './CreateCharacterFeat';
import CharacterSpell from './CreateCharacterSpell';
import CharacterFinish from './CreateCharacterFinish';

export default function CreateCharacter(): JSX.Element {
  const [create] = useState(() => new CreateCharacterStore());

  return (
    <CreateCharacterStoreContext.Provider value={create}>
      <>
        <Bread items={[{ text: '新建角色', link: '/player/create' }]} />

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
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { FaChevronLeft } from 'react-icons/fa';
import { Prompt, Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';

import { Box, Icon } from '@chakra-ui/react';

import { UpgradeCharacterStore, UpgradeCharacterStoreContext } from '../../store/upgradeCharacter';
import { HStackNav, HStackNavItem } from '../HStackNav';
import { useBreadcrumb } from './Bread';
import { CreateCharacterBasic as CharacterBasic } from './UpgradeCharacterBasic';
import { UpgradeCharacterFeat as CharacterFeat } from './UpgradeCharacterFeat';
import { UpgradeCharacterFeat as CharacterFinish } from './UpgradeCharacterFinish';
import { UpgradeCharacterSkills as CharacterSkill } from './UpgradeCharacterSkill';
import { UpgradeCharacterSpell as CharacterSpell } from './UpgradeCharacterSpell';
import { HistoryUnblockContext, useCurrentCharacter } from './context';

export function UpgradeCharacter(): JSX.Element {
  const character = useCurrentCharacter();
  // initialize here will cause react setstate and mobx action conflict, so do it in an effect
  const [upgrade, setUpgrade] = useState<UpgradeCharacterStore | null>(null);
  const historyUnblock = useRef<null | (() => void)>(null);
  const { url, path } = useRouteMatch();
  const blocking = useRef(true);
  const promptMessage = useCallback(
    (location) => {
      if (location.pathname.includes('upgrade') || !blocking.current) {
        return true;
      }

      return '确定取消升级吗?';
    },
    [blocking]
  );

  useBreadcrumb('升级', url);

  useEffect(() => {
    setUpgrade(new UpgradeCharacterStore(character));

    return () => {
      character.cancelUpgrade();
    };
  }, [character]);

  useEffect(() => {
    historyUnblock.current = () => {
      blocking.current = false;
    };
  }, []);

  return (
    <HistoryUnblockContext.Provider value={historyUnblock}>
      {upgrade ? (
        <UpgradeCharacterStoreContext.Provider value={upgrade}>
          <>
            <Prompt message={promptMessage} />

            <HStackNav mb="6">
              <HStackNavItem
                backgroundColor="red.500"
                color="white"
                borderColor="red.500"
                flexGrow={0}
                to={`${url}/../`}
                _hover={{ textDecoration: 'none', backgroundColor: 'red.600' }}
              >
                <Icon as={FaChevronLeft} color="white" boxSize="1.2rem" />
              </HStackNavItem>
              <HStackNavItem to={`${url}/basic`}>基础</HStackNavItem>
              <HStackNavItem to={`${url}/skill`}>技能</HStackNavItem>
              <HStackNavItem to={`${url}/feat`}>专长</HStackNavItem>
              <HStackNavItem to={`${url}/spell`}>法术</HStackNavItem>
              <HStackNavItem to={`${url}/finish`}>完成</HStackNavItem>
            </HStackNav>

            <Box>
              <Switch>
                <Route path={`${path}/basic`} component={CharacterBasic} />
                <Route path={`${path}/skill`} component={CharacterSkill} />
                <Route path={`${path}/feat`} component={CharacterFeat} />
                <Route path={`${path}/spell`} component={CharacterSpell} />
                <Route path={`${path}/finish`} component={CharacterFinish} />

                <Redirect to={`${url}/basic`} />
              </Switch>
            </Box>
          </>
        </UpgradeCharacterStoreContext.Provider>
      ) : null}
    </HistoryUnblockContext.Provider>
  );
}

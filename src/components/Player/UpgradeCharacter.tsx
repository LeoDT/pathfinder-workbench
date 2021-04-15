import { useEffect, useRef, useState } from 'react';
import { Switch, Route, Redirect, useRouteMatch, useHistory } from 'react-router-dom';
import { Box, Icon } from '@chakra-ui/react';
import { FaChevronLeft } from 'react-icons/fa';

import UpgradeCharacterStore, { UpgradeCharacterStoreContext } from '../../store/upgradeCharacter';

import { useCurrentCharacter, HistoryUnblockContext } from './context';

import { HStackNav, HStackNavItem } from '../HStackNav';
import { useBreadcrumb } from './Bread';

import CharacterBasic from './UpgradeCharacterBasic';
import CharacterSkill from './UpgradeCharacterSkill';
import CharacterFeat from './UpgradeCharacterFeat';
import CharacterSpell from './UpgradeCharacterSpell';
import CharacterFinish from './UpgradeCharacterFinish';

export default function UpgradeCharacter(): JSX.Element {
  const character = useCurrentCharacter();
  // initialize here will cause react setstate and mobx action conflict, so do it in an effect
  const [upgrade, setUpgrade] = useState<UpgradeCharacterStore | null>(null);
  const historyUnblock = useRef<null | (() => void)>(null);
  const { url, path } = useRouteMatch();
  const history = useHistory();

  useBreadcrumb('升级', url);

  useEffect(() => {
    setUpgrade(new UpgradeCharacterStore(character));
  }, [character]);

  useEffect(() => {
    const unblock = history.block((location) => {
      if (!location.pathname.includes('upgrade')) {
        return '确定取消升级吗?';
      }
    });

    historyUnblock.current = unblock;

    return () => {
      unblock();

      character.cancelUpgrade();
    };
  }, [character]);

  return (
    <HistoryUnblockContext.Provider value={historyUnblock}>
      {upgrade ? (
        <UpgradeCharacterStoreContext.Provider value={upgrade}>
          <>
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

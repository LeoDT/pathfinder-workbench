import { autorun } from 'mobx';
import { useEffect, useState } from 'react';
import { useParams, Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';

import { useStore } from '../../store';
import Character from '../../store/character';
import { CurrentCharacterContext } from './context';

import Bread, { useBreadcrumb } from './Bread';
import CharacterDetailBasic from './CharacterDetailBasic';
import CharacterUpgrade from './UpgradeCharacter';

export default function CharacterDetail(): JSX.Element | null {
  const store = useStore();
  const { id } = useParams<{ id: string }>();
  const { path, url } = useRouteMatch();
  const [character, setCharacter] = useState<Character | null>(null);

  useBreadcrumb(`角色: ${character?.name || ''}`, url);

  useEffect(() => {
    const dispose = autorun(() => {
      if (id) {
        const c = store.characters.find((c) => c.id === id);

        if (c) {
          setCharacter(c);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).character = c;
        }
      }
    });

    return () => {
      dispose();
    };
  }, [id]);

  return character ? (
    <CurrentCharacterContext.Provider value={character}>
      <>
        <Bread mb="2" />

        <Switch>
          <Route path={`${path}/basic`} component={CharacterDetailBasic} />
          <Route path={`${path}/upgrade`} component={CharacterUpgrade} />

          <Redirect to={`${path}/basic`} />
        </Switch>
      </>
    </CurrentCharacterContext.Provider>
  ) : null;
}

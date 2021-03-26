import { autorun } from 'mobx';
import { useEffect, useState } from 'react';
import { useParams, Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';

import { useStore } from '../../store';
import Character from '../../store/character';
import { CurrentCharacterContext } from './context';

import Bread from './Bread';
import CharacterDetailBasic from './CharacterDetailBasic';

export default function CharacterDetail(): JSX.Element | null {
  const store = useStore();
  const { id } = useParams<{ id: string }>();
  const { path } = useRouteMatch();
  const [character, setCharacter] = useState<Character | null>(null);

  useEffect(() => {
    const dispose = autorun(() => {
      if (id) {
        const c = store.characters.find((c) => c.id === id);

        if (c) {
          setCharacter(c);
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
        <Bread items={[{ text: `角色: ${character.name}`, link: path }]} />

        <Switch>
          <Route path={`${path}/basic`} component={CharacterDetailBasic} />

          <Redirect to={`${path}/basic`} />
        </Switch>
      </>
    </CurrentCharacterContext.Provider>
  ) : null;
}

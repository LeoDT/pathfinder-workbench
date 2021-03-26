import { Container } from '@chakra-ui/react';
import { Route, Switch, Redirect } from 'react-router-dom';

import CharacterList from '../components/Player/CharacterList';
import CreateCharacter from '../components/Player/CreateCharacter';
import CharacterDetail from '../components/Player/CharacterDetail';

export default function PlayerPage(): JSX.Element {
  return (
    <Container pt="4" px={['2', '0']}>
      <Switch>
        <Route path="/player/list" component={CharacterList} />
        <Route path="/player/create" component={CreateCharacter} />
        <Route path="/player/character/:id" component={CharacterDetail} />

        <Redirect to="/player/list" />
      </Switch>
    </Container>
  );
}

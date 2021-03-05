import { Container } from '@chakra-ui/react';
import { Route, Switch, Redirect } from 'react-router-dom';

import CharacterList from '../components/Player/CharacterList';
import CreateCharacter from '../components/Player/CreateCharacter';

export default function PlayerPage(): JSX.Element {
  return (
    <Container pt="4">
      <Switch>
        <Route path="/player/list" component={CharacterList} />
        <Route path="/player/create" component={CreateCharacter} />

        <Redirect to="/player/list" />
      </Switch>
    </Container>
  );
}

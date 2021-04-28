import { Container } from '@chakra-ui/react';
import { Route, Switch, Redirect } from 'react-router-dom';

import { useBreadcrumbs, BreadcrumbManagerContext } from '../components/Player/Bread';
import CharacterList from '../components/Player/CharacterList';
import CreateCharacter from '../components/Player/CreateCharacter';
import CharacterDetail from '../components/Player/CharacterDetail';

export default function PlayerPage(): JSX.Element {
  const breadcrumbs = useBreadcrumbs([{ link: '/player', text: 'PC' }]);

  return (
    <BreadcrumbManagerContext.Provider value={breadcrumbs}>
      <Container py="4" px={['2', '0']}>
        <Switch>
          <Route path="/player/list" component={CharacterList} />
          <Route path="/player/create" component={CreateCharacter} />
          <Route path="/player/character/:id" component={CharacterDetail} />

          <Redirect to="/player/list" />
        </Switch>
      </Container>
    </BreadcrumbManagerContext.Provider>
  );
}

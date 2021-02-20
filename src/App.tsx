import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { Box } from '@chakra-ui/react';

import Navbar from './components/Navbar';
import PlayerPage from './pages/PlayerPage';
import DMPage from './pages/DMPage';

function App(): JSX.Element {
  return (
    <Router basename={process.env.NODE_ENV === 'development' ? '/' : '/pathfinder-workbench'}>
      <Box>
        <Navbar />

        <Box pt="4">
          <Switch>
            <Route path="/player" component={PlayerPage} />
            <Route path="/dm" component={DMPage} />

            <Redirect to="/player" />
          </Switch>
        </Box>
      </Box>
    </Router>
  );
}

export default App;

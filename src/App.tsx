import { Redirect, Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import { EntityQuickViewer } from './components/EntityQuickViewer';
import { Navbar } from './components/Navbar';
import { DMPage } from './pages/DMPage';
import { PlayerPage } from './pages/PlayerPage';

export function App(): JSX.Element {
  return (
    <Router basename={process.env.NODE_ENV === 'development' ? '/' : process.env.PFWB_BASENAME}>
      <>
        <Navbar />

        <>
          <Switch>
            <Route path="/player" component={PlayerPage} />
            <Route path="/dm" component={DMPage} />

            <Redirect to="/player" />
          </Switch>
        </>

        <EntityQuickViewer />
      </>
    </Router>
  );
}

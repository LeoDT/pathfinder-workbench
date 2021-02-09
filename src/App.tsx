import { Route } from 'wouter';
import { Box } from '@chakra-ui/react';

import Navbar from './components/Navbar';
import SearchSpellPage from './pages/SearchSpellPage';

function App(): JSX.Element {
  return (
    <Box>
      <Navbar />

      <Route path="/spell" component={SearchSpellPage} />
    </Box>
  );
}

export default App;

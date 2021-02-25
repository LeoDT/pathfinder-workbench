import React from 'react';
import ReactDOM from 'react-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { configure } from 'mobx';

import { CONTAINER_WIDTH } from './constant';
import { StoreContext, Store } from './store';

import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

configure({ enforceActions: 'never' });

const theme = extendTheme({
  components: {
    Container: {
      baseStyle: {
        maxW: CONTAINER_WIDTH,
      },
    },
  },
});

const store = new Store();

async function init() {
  await store.init();

  ReactDOM.render(
    <React.StrictMode>
      <ChakraProvider theme={theme}>
        <StoreContext.Provider value={store}>
          <App />
        </StoreContext.Provider>
      </ChakraProvider>
    </React.StrictMode>,
    document.getElementById('root')
  );
}

init();

let refreshing = false;
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    if (confirm('New version found, update?')) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) {
          return;
        }

        refreshing = true;
        window.location.reload();
      });

      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
    }
  },
});

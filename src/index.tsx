import './style.scss';

import { configure } from 'mobx';
import React from 'react';
import ReactDOM from 'react-dom';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';

import { App } from './App';
import { CONTAINER_WIDTH } from './constant';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { Store, StoreContext } from './store';

configure({ enforceActions: 'never' });

const theme = extendTheme({
  colors: {
    gray: {
      10: '#F6F6F6',
    },
  },
  zIndices: {
    quickViewer: 3000,
  },
  shadows: {
    inner: 'inset 0 0 5px rgba(0,0,0,0.2)',
  },
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

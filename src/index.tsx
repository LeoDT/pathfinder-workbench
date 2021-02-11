import React from 'react';
import ReactDOM from 'react-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { configure } from 'mobx';

import { CONTAINER_WIDTH } from './constant';
import { StoreContext, Store } from './store';

import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

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

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

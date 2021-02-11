import { createContext, useContext } from 'react';
import { useMediaQuery } from '@chakra-ui/react';

import { CONTAINER_WIDTH } from '../constant';

export function createContextNoNullCheck<T>(defaults?: T): [() => T, React.Context<T | undefined>] {
  const context = createContext<T | undefined>(defaults);

  function use(): T {
    const c = useContext(context);

    if (typeof c === 'undefined') {
      throw new Error('useContext must be inside a Provider with a value');
    }

    return c;
  }

  return [use, context];
}

export function useIsSmallerScreen(): boolean {
  return useMediaQuery(`(max-width: ${CONTAINER_WIDTH - 1}px)`)[0];
}

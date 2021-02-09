import { createContext, useContext } from 'react';

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

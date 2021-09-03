import { shuffle } from 'lodash-es';
export { random } from 'lodash-es';

export function randomPick<T>(arr: T[]): T {
  return shuffle(arr)[0];
}

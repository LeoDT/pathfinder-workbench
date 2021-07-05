import Ajv, { DefinedError } from 'ajv';

import SCHEMA from '../schema.json';

export const ajv = new Ajv({ schemas: [SCHEMA] });

export function validate(name: string, data: unknown): [boolean, DefinedError[] | null] {
  const valid = ajv.validate(`#/definitions/${name}`, data);

  if (!valid) {
    console.warn('validation failed', ajv.errors, data);
  }

  return [valid, ajv.errors as DefinedError[] | null];
}

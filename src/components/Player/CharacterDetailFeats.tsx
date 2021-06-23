import { partition } from 'lodash-es';

import { SimpleGrid, Text } from '@chakra-ui/react';

import { ClassFeat, Feat, RacialTrait } from '../../types/core';
import { EffectInputDisplayer } from '../EffectInputDisplayer';
import SimpleEntity, { SimpleEntityWithChild } from '../SimpleEntity';
import { useCurrentCharacter } from './context';

interface Props {
  entitiesWithInput: Array<{ entity: ClassFeat | RacialTrait | Feat; input: unknown }>;
}

export function CharacterDetailFeats({ entitiesWithInput }: Props): JSX.Element {
  const character = useCurrentCharacter();
  const [withInput, other] = partition(entitiesWithInput, (fi) => fi.input);

  return (
    <>
      {withInput.length > 0 ? (
        <SimpleGrid columns={[1, 3]} spacing="2">
          {withInput.map(({ entity, input }, i) => {
            const es = input
              ? character.effect.effectsNeedInput.find(
                  (es) => es.source === entity && es.input === input
                )
              : null;

            return es ? (
              <SimpleEntityWithChild
                key={`${entity.id}:${i}`}
                entity={entity}
                child={<EffectInputDisplayer source={es.source} effect={es.effect} input={input} />}
              />
            ) : null;
          })}
        </SimpleGrid>
      ) : null}
      {other.length > 0 ? (
        <SimpleGrid columns={[1, 3]} spacing="2" mt="2">
          {other.map(({ entity }, i) => (
            <SimpleEntity key={`${entity.id}:${i}`} entity={entity} />
          ))}
        </SimpleGrid>
      ) : null}
      {entitiesWithInput.length === 0 ? <Text color="grey">学而不专</Text> : null}
    </>
  );
}

import { partition } from 'lodash-es';
import { Observer } from 'mobx-react-lite';

import { SimpleGrid } from '@chakra-ui/react';

import CreateCharacterStore from '../../store/createCharacter';
import { ClassFeat, Feat, RacialTrait } from '../../types/core';
import SimpleEntity from '../SimpleEntity';
import { SimpleEntityWithEffectInput } from './SimpleEntityWithEffectInput';

interface Props {
  entities: Array<Feat | ClassFeat | RacialTrait>;
  effectInputSuffixes?: Array<string>;
  createOrUpgrade: CreateCharacterStore;

  isReadonly?: (f: Feat | ClassFeat | RacialTrait) => boolean;
}

export function FeatWithEffectInputGrid({
  entities,
  effectInputSuffixes,
  createOrUpgrade,
  isReadonly,
}: Props): JSX.Element {
  return (
    <Observer>
      {() => {
        const effectsNeedInput = createOrUpgrade.character.effect.effectsNeedInput;
        const [withEffect, other] = partition(entities, (e) =>
          effectsNeedInput.find(({ source }) => source === e)
        );

        return (
          <>
            {withEffect.length > 0 ? (
              <SimpleGrid columns={[1, 3]} spacing="2" mb="2">
                {withEffect.map((e, i) => {
                  const es = effectsNeedInput.find(({ source }) => source === e);

                  if (es) {
                    const effectInputSuffix = effectInputSuffixes?.[i] || '';

                    return (
                      <SimpleEntityWithEffectInput
                        key={e.id}
                        entity={e}
                        effect={es.effect}
                        createOrUpgrade={createOrUpgrade}
                        value={createOrUpgrade.getEffectInput(
                          es.source._type,
                          e.id,
                          effectInputSuffix
                        )}
                        onChange={(v) => {
                          createOrUpgrade.setEffectInput(
                            es.source._type,
                            e.id,
                            v,
                            effectInputSuffix
                          );
                        }}
                        readonly={isReadonly ? isReadonly(e) : false}
                      />
                    );
                  }
                })}
              </SimpleGrid>
            ) : null}
            <SimpleGrid columns={[1, 3]} spacing="2">
              {other.map((e) => (
                <SimpleEntity key={e.id} entity={e} />
              ))}
            </SimpleGrid>
          </>
        );
      }}
    </Observer>
  );
}

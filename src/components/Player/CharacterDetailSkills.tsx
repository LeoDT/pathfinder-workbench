import { Observer } from 'mobx-react-lite';
import { useState } from 'react';

import { Box, Button, Tag, Wrap, WrapItem } from '@chakra-ui/react';

import { ABILITY_COLORS_SCHEME } from '../../constant';
import { useStore } from '../../store';
import { showModifier } from '../../utils/modifier';
import { useCurrentCharacter } from './context';

export function CharacterDetailSkills(): JSX.Element {
  const { collections } = useStore();
  const character = useCurrentCharacter();
  const [showAll, setShowAll] = useState(false);

  return (
    <Box position="relative">
      <Box position="absolute" right="0" top="-9">
        <Button size="sm" onClick={() => setShowAll(!showAll)}>
          {showAll ? '显示已有等级' : '显示全部'}
        </Button>
      </Box>
      <Observer>
        {() => {
          const col =
            character.skillSystem === 'core'
              ? collections.coreSkill
              : collections.consolidatedSkill;
          const children: Array<JSX.Element> = [];
          const skills = showAll
            ? col.data
            : Array.from(character.skillRanks.keys()).map((s) => col.getById(s));

          skills.forEach((s) => {
            const detail = character.getSkillDetail(s);

            children.push(
              <WrapItem key={s.id}>
                <Tag
                  colorScheme={ABILITY_COLORS_SCHEME[s.ability]}
                  variant="outline"
                  cursor="default"
                >
                  {s.name} {showModifier(detail.total)}
                </Tag>
              </WrapItem>
            );
          });

          return <Wrap spacing="2">{children}</Wrap>;
        }}
      </Observer>
    </Box>
  );
}

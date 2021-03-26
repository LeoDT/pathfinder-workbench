import { HStack, Box, Text, Spacer, StackProps, Heading, SimpleGrid } from '@chakra-ui/react';
import { useCurrentCharacter } from './context';

import { AbilityType } from '../../types/core';
import { sizeTranslates } from '../../utils/race';
import { abilityTranslates, showModifier } from '../../utils/ability';

import StatNumber from '../StatNumber';
import AbilityIcon from '../AbilityIcon';
import TextWithLinebreaks from '../TextWithLinebreaks';
import SimpleEntity from '../SimpleEntity';
import { Block, VBlockItem, HBlockItem } from './CharacterBlock';

const rowStyle: StackProps = {
  alignItems: 'stretch',
  flexWrap: 'wrap',
  spacing: [0, 2],
};

const abilityStyle: StackProps = {
  flexBasis: [1 / 2, 1 / 3],
  p: '2',
  borderRight: '1px',
  borderBottom: '1px',
  borderColor: 'gray.200',
};

export default function CharacterDetailBasic(): JSX.Element {
  const character = useCurrentCharacter();

  function showAbility(t: AbilityType) {
    return (
      <>
        <AbilityIcon ability={t} iconSize={[8, 9]} />
        <Text whiteSpace="nowrap">{abilityTranslates[t]}</Text>
        <Spacer />
        <StatNumber
          numberProps={{
            fontSize: 'xl',
          }}
          number={character.ability[t]}
          text="score"
        />
        <StatNumber
          numberProps={{
            fontSize: 'xl',
          }}
          number={showModifier(character.abilityModifier[t])}
          text="mod"
        />
      </>
    );
  }

  return (
    <>
      <HStack {...rowStyle}>
        <HStack w={['full', '40%']} flexShrink={0}>
          <Block w="50%">
            <VBlockItem label="种族">{character.race.name}</VBlockItem>
            <VBlockItem label="体型">{sizeTranslates[character.race.size]}</VBlockItem>
            <VBlockItem label="速度">{character.race.speed}尺</VBlockItem>
          </Block>
          <Block w="50%">
            <VBlockItem label="职业">
              {character.levelDetailForShow.map((t) => (
                <Box key={t}>{t}</Box>
              ))}
            </VBlockItem>
            <VBlockItem label="阵营">混乱善良</VBlockItem>
            <VBlockItem label="信仰">莎伦莱</VBlockItem>
          </Block>
        </HStack>

        <Block flex="1" w={['full', 'auto']}>
          <HStack spacing="0" flexWrap="wrap">
            <HStack {...abilityStyle} flexGrow={1}>
              {showAbility(AbilityType.str)}
            </HStack>
            <HStack {...abilityStyle} borderRightWidth={['0px', '1px']} flexGrow={1}>
              {showAbility(AbilityType.dex)}
            </HStack>
            <HStack {...abilityStyle} borderRightWidth={['1px', '0px']} flexGrow={1}>
              {showAbility(AbilityType.con)}
            </HStack>
            <HStack
              {...abilityStyle}
              borderRightWidth={['0px', '1px']}
              borderBottomWidth={['1px', '0px']}
              flexGrow={1}
            >
              {showAbility(AbilityType.int)}
            </HStack>
            <HStack {...abilityStyle} borderBottomWidth="0px" flexGrow={1}>
              {showAbility(AbilityType.wis)}
            </HStack>
            <HStack {...abilityStyle} borderRightWidth="0px" borderBottomWidth="0px" flexGrow={1}>
              {showAbility(AbilityType.cha)}
            </HStack>
          </HStack>
        </Block>
      </HStack>

      <HStack {...rowStyle}>
        <Block w={['full', '50%']} flex="1">
          <HStack w="full" justifyContent="stretch">
            <HBlockItem label="HP" flexBasis={1 / 3} flexGrow={1}>
              {character.status.hp}
            </HBlockItem>
            <HBlockItem label="先攻" flexBasis={1 / 3} flexGrow={1}>
              {showModifier(character.status.initiative)}
            </HBlockItem>
            <HBlockItem label="察觉" flexBasis={1 / 3} flexGrow={1}>
              {showModifier(character.skillRanks.get('perception') || 0)}
            </HBlockItem>
          </HStack>
        </Block>

        <Block w={['full', '50%']} flex="1">
          <HStack w="full" justifyContent="stretch">
            <HBlockItem label="强韧" flexBasis={1 / 3} flexGrow={1}>
              {showModifier(character.status.fortitude)}
            </HBlockItem>
            <HBlockItem label="反射" flexBasis={1 / 3} flexGrow={1}>
              {showModifier(character.status.reflex)}
            </HBlockItem>
            <HBlockItem label="意志" flexBasis={1 / 3} flexGrow={1}>
              {showModifier(character.status.will)}
            </HBlockItem>
          </HStack>
        </Block>
      </HStack>

      <HStack {...rowStyle}>
        <Block w={['full', '50%']} flex="1">
          <HStack w="full" justifyContent="stretch">
            <HBlockItem label="BAB" flexBasis={1 / 3} flexGrow={1}>
              {character.status.bab.map((b) => showModifier(b)).join('/')}
            </HBlockItem>
            <HBlockItem label="CMB" flexBasis={1 / 3} flexGrow={1}>
              {showModifier(character.status.cmb)}
            </HBlockItem>
            <HBlockItem label="CMD" flexBasis={1 / 3} flexGrow={1}>
              {character.status.cmd}
            </HBlockItem>
          </HStack>
        </Block>

        <Block w={['full', '50%']} flex="1">
          <HStack w="full" justifyContent="stretch">
            <HBlockItem label="AC" flexBasis={1 / 3} flexGrow={1}>
              {character.status.ac}
            </HBlockItem>
            <HBlockItem label="措手不及" flexBasis={1 / 3} flexGrow={1}>
              {character.status.flatFooted}
            </HBlockItem>
            <HBlockItem label="接触" flexBasis={1 / 3} flexGrow={1}>
              {character.status.touch}
            </HBlockItem>
          </HStack>
        </Block>
      </HStack>

      {Array.from(character.gainedClassFeats.entries()).map(([clas, feats]) => (
        <Block p="2" key={clas.id}>
          <Heading as="h4" fontSize="xl" mb="4">
            {clas.name} ({character.getLevelForClass(clas)}级)
          </Heading>
          {feats.map((cf) => (
            <Box
              key={cf.id}
              mb="4"
              borderBottom="1px"
              borderColor="gray.200"
              _last={{ mb: '0', borderBottom: '0px' }}
            >
              <Heading as="h6" fontSize="lg" fontWeight="bold" mb="3" color="teal">
                {cf.name} ({cf.id})
              </Heading>
              <TextWithLinebreaks text={cf.desc} textProps={{ mb: '2' }} />
            </Box>
          ))}
        </Block>
      ))}

      <Block p="2">
        <Heading as="h4" fontSize="xl" mb="4">
          专长背景
        </Heading>
        <SimpleGrid columns={[1, 3]} spacing="2">
          {character.gainedFeats.map((f) => (
            <SimpleEntity key={f.id} entity={f} entityType="feat" />
          ))}
        </SimpleGrid>
      </Block>

      <Block p="2">
        <Heading as="h4" fontSize="xl" mb="4">
          种族特性
        </Heading>
        {character.race.racialTrait.map((rt) => (
          <Box
            key={rt.id}
            mb="3"
            borderBottom="1px"
            borderColor="gray.200"
            _last={{ mb: '0', borderBottom: '0px' }}
          >
            <Heading as="h6" fontSize="lg" fontWeight="bold" mb="3" color="teal">
              {rt.name} ({rt.id})
            </Heading>
            <TextWithLinebreaks text={rt.desc} textProps={{ mb: '2' }} />
          </Box>
        ))}
      </Block>
    </>
  );
}

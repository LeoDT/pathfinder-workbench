import { uniq } from 'lodash-es';
import { Observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';

import { Box, Button, HStack, Spacer, Stack, StackProps, Text, VStack } from '@chakra-ui/react';

import { AbilityType } from '../../types/core';
import { abilityTranslates } from '../../utils/ability';
import { alignmentTranslates } from '../../utils/alignment';
import { showModifier } from '../../utils/modifier';
import { sizeTranslates } from '../../utils/race';
import AbilityIcon from '../AbilityIcon';
import StatNumber from '../StatNumber';
import { Block, BlockHeading, HBlockItem, VBlockItem } from './CharacterBlock';
import { CharacterDetailAttackOptions } from './CharacterDetailAttackOptions';
import CharacterDetailEquip from './CharacterDetailEquip';
import { CharacterDetailFeats } from './CharacterDetailFeats';
import { CharacterDetailSkills } from './CharacterDetailSkills';
import CharacterDetailStorage from './CharacterDetailStorage';
import { useCurrentCharacter } from './context';

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
      <Box position="relative">
        <Button
          position="absolute"
          right="0"
          top="-10"
          as={Link}
          to={`/player/character/${character.id}/upgrade`}
          colorScheme="teal"
          size="sm"
        >
          升级
        </Button>
      </Box>

      <Observer>
        {() => (
          <VStack alignItems="stretch">
            <Stack direction={['column', 'row']}>
              <HStack w={['full', '40%']} alignItems="flex-start" flexShrink={0}>
                <Box w="50%">
                  <Block>
                    <VBlockItem label="种族">{character.race.name}</VBlockItem>
                    <VBlockItem label="体型">{sizeTranslates[character.race.size]}</VBlockItem>
                    <VBlockItem label="速度">{character.race.speed}尺</VBlockItem>
                  </Block>
                </Box>
                <Box w="50%">
                  <Block>
                    <VBlockItem label="职业">
                      {character.levelDetailForShow.map((t) => (
                        <Box key={t}>{t}</Box>
                      ))}
                    </VBlockItem>
                    <VBlockItem label="阵营">{alignmentTranslates[character.alignment]}</VBlockItem>
                    <VBlockItem label="信仰">莎伦莱</VBlockItem>
                  </Block>
                </Box>
              </HStack>

              <Box flex="1" w={['full', 'auto']}>
                <Block>
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
                    <HStack
                      {...abilityStyle}
                      borderRightWidth="0px"
                      borderBottomWidth="0px"
                      flexGrow={1}
                    >
                      {showAbility(AbilityType.cha)}
                    </HStack>
                  </HStack>
                </Block>
              </Box>
            </Stack>

            <Stack direction={['column', 'row']}>
              <Box w={['full', '50%']} flex="1">
                <Block>
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
              </Box>

              <Box w={['full', '50%']} flex="1">
                <Block>
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
              </Box>
            </Stack>

            <Stack direction={['column', 'row']}>
              <Box w={['full', '50%']} flex="1">
                <Block>
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
              </Box>

              <Box w={['full', '50%']} flex="1">
                <Block>
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
              </Box>
            </Stack>

            <Stack direction={['column', 'row']}>
              <Block flexBasis={['50%', '100%']}>
                <Box p="2">
                  <BlockHeading>攻击</BlockHeading>
                  <CharacterDetailAttackOptions />
                </Box>
              </Block>
              <Block flexBasis={['50%', '100%']}>
                <Box p="2">
                  <BlockHeading>技能</BlockHeading>
                  <CharacterDetailSkills />
                </Box>
              </Block>
            </Stack>

            <Stack direction={['column', 'row']} alignItems={['flex-start', 'stretch']}>
              <Box flexBasis={['50%', '100%']}>
                <Block p="2" h="full">
                  <BlockHeading>装备</BlockHeading>
                  <CharacterDetailEquip />
                </Block>
              </Box>
              <Box flexBasis={['50%', '100%']}>
                <Block p="2" h="full">
                  <BlockHeading>仓库</BlockHeading>
                  <CharacterDetailStorage />
                </Block>
              </Box>
            </Stack>

            {Array.from(character.gainedClassFeats.entries()).map(([clas, feats]) => (
              <Block p="2" key={clas.id}>
                <BlockHeading>
                  {clas.name} ({character.getLevelForClass(clas)}级)
                </BlockHeading>
                <CharacterDetailFeats
                  entitiesWithInput={uniq(feats).map((f) => ({
                    entity: f,
                    input: character.effect.getEffectInputForClassFeat(clas, f),
                  }))}
                />
              </Block>
            ))}

            <Block p="2">
              <BlockHeading>专长背景</BlockHeading>
              <CharacterDetailFeats
                entitiesWithInput={character.effect.gainedFeatsWithEffectInputs.map((fi) => ({
                  entity: fi.feat,
                  input: fi.input,
                }))}
              />
            </Block>

            <Block p="2">
              <BlockHeading>种族特性</BlockHeading>
              <CharacterDetailFeats
                entitiesWithInput={character.racialTraits.map((t) => ({
                  entity: t,
                  input: character.effect.getEffectInputForRacialTrait(t),
                }))}
              />
            </Block>
          </VStack>
        )}
      </Observer>
    </>
  );
}

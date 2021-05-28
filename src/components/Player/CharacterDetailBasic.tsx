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
import { Block, BlockHeading, HBlockItem, VBlockItem, HBlockItemForBonus } from './CharacterBlock';
import { CharacterDetailAttackOptions } from './CharacterDetailAttackOptions';
import CharacterDetailEquip from './CharacterDetailEquip';
import { CharacterDetailFeats } from './CharacterDetailFeats';
import { CharacterDetailSkills } from './CharacterDetailSkills';
import { CharacterDetailSpells } from './CharacterDetailSpells';
import CharacterDetailStorage from './CharacterDetailStorage';
import { useCurrentCharacter } from './context';

const abilityStyle: StackProps = {
  flexBasis: ['50%', '33%'],
  flexGrow: 1,
  flexShrink: 1,
  p: '2',
  borderRight: '1px',
  borderBottom: '1px',
  borderColor: 'gray.200',
};

const hStackForBonusStyle = {
  w: 'full',
  justifyContent: 'stretch',
  spacing: '0',
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
                    <HStack {...abilityStyle}>{showAbility(AbilityType.str)}</HStack>
                    <HStack {...abilityStyle} borderRightWidth={['0px', '1px']}>
                      {showAbility(AbilityType.dex)}
                    </HStack>
                    <HStack {...abilityStyle} borderRightWidth={['1px', '0px']}>
                      {showAbility(AbilityType.con)}
                    </HStack>
                    <HStack
                      {...abilityStyle}
                      borderRightWidth={['0px', '1px']}
                      borderBottomWidth={['1px', '0px']}
                    >
                      {showAbility(AbilityType.int)}
                    </HStack>
                    <HStack {...abilityStyle} borderBottomWidth="0px">
                      {showAbility(AbilityType.wis)}
                    </HStack>
                    <HStack {...abilityStyle} borderRightWidth="0px" borderBottomWidth="0px">
                      {showAbility(AbilityType.cha)}
                    </HStack>
                  </HStack>
                </Block>
              </Box>
            </Stack>

            <Stack direction={['column', 'row']}>
              <Box w={['full', '50%']} flex="1">
                <Block>
                  <HStack {...hStackForBonusStyle}>
                    <HBlockItemForBonus label="HP" bonuses={character.status.hpBonuses}>
                      {character.status.hp}
                    </HBlockItemForBonus>

                    <HBlockItemForBonus label="先攻" bonuses={character.status.initiativeBonuses}>
                      {showModifier(character.status.initiative)}
                    </HBlockItemForBonus>

                    <Box flexBasis={1 / 3} flexGrow={1}>
                      <HBlockItem label="察觉" borderRight="0">
                        {showModifier(character.skillRanks.get('perception') || 0)}
                      </HBlockItem>
                    </Box>
                  </HStack>
                </Block>
              </Box>

              <Box w={['full', '50%']} flex="1">
                <Block>
                  <HStack {...hStackForBonusStyle}>
                    <HBlockItemForBonus label="强韧" bonuses={character.status.fortitudeBonuses}>
                      {showModifier(character.status.fortitude)}
                    </HBlockItemForBonus>
                    <HBlockItemForBonus label="反射" bonuses={character.status.reflexBonuses}>
                      {showModifier(character.status.reflex)}
                    </HBlockItemForBonus>
                    <HBlockItemForBonus label="意志" bonuses={character.status.willBonuses}>
                      {showModifier(character.status.will)}
                    </HBlockItemForBonus>
                  </HStack>
                </Block>
              </Box>
            </Stack>

            <Stack direction={['column', 'row']}>
              <Box w={['full', '50%']} flex="1">
                <Block>
                  <HStack {...hStackForBonusStyle}>
                    <Box flexBasis={1 / 3} flexGrow={1}>
                      <HBlockItem label="BAB">
                        {character.status.bab.map((b) => showModifier(b)).join('/')}
                      </HBlockItem>
                    </Box>
                    <HBlockItemForBonus label="CMB" bonuses={character.status.cmbBonuses}>
                      {showModifier(character.status.cmb)}
                    </HBlockItemForBonus>
                    <HBlockItemForBonus label="CMD" bonuses={character.status.cmdBonuses}>
                      {showModifier(character.status.cmd)}
                    </HBlockItemForBonus>
                  </HStack>
                </Block>
              </Box>

              <Box w={['full', '50%']} flex="1">
                <Block>
                  <HStack {...hStackForBonusStyle}>
                    <HBlockItemForBonus label="AC" bonuses={character.status.acBonuses}>
                      {character.status.ac}
                    </HBlockItemForBonus>
                    <HBlockItemForBonus
                      label="措手不及"
                      bonuses={character.status.flatFootedBonuses}
                    >
                      {character.status.flatFooted}
                    </HBlockItemForBonus>
                    <HBlockItemForBonus label="接触" bonuses={character.status.touchBonuses}>
                      {character.status.touch}
                    </HBlockItemForBonus>
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

            <Stack direction={['column', 'row']}>
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

            {character.spellbooks.map((b) => (
              <Stack direction={['column', 'row']} key={b.class.id}>
                <Box flexBasis={['50%', '100%']}>
                  <Block p="2" h="full">
                    <BlockHeading>法术</BlockHeading>
                    <CharacterDetailSpells spellbook={b} />
                  </Block>
                </Box>
                <Box flexBasis={['50%', '100%']}>
                  <Block p="2" h="full">
                    <BlockHeading>Trackers</BlockHeading>
                  </Block>
                </Box>
              </Stack>
            ))}

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

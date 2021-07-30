import { Observer } from 'mobx-react-lite';
import { FaPen } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import {
  Box,
  Button,
  HStack,
  Icon,
  Input,
  Spacer,
  Stack,
  StackProps,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';

import { AbilityType } from '../../types/core';
import { abilityTranslates } from '../../utils/ability';
import { alignmentTranslates } from '../../utils/alignment';
import { showCoin } from '../../utils/coin';
import { showWeight, uniqByLast } from '../../utils/misc';
import { showModifier } from '../../utils/modifier';
import { sizeTranslates } from '../../utils/race';
import { carryLoadTranslates } from '../../utils/weight';
import { AbilityIcon } from '../AbilityIcon';
import { NamedBonusPopover } from '../NamedBonusPopover';
import { StatNumber } from '../StatNumber';
import {
  Block,
  BlockHeading,
  HBlockItem,
  HBlockItemForBonus,
  VBlockItem,
  VBlockItemForBonus,
} from './CharacterBlock';
import { CharacterDetailAttackOptions } from './CharacterDetailAttackOptions';
import { CharacterDetailEquip } from './CharacterDetailEquip';
import { CharacterDetailFeats } from './CharacterDetailFeats';
import { CharacterDetailManualEffectsModal } from './CharacterDetailManualEffects';
import { CharacterDetailSkills } from './CharacterDetailSkills';
import { CharacterDetailSpells } from './CharacterDetailSpells';
import { CharacterDetailStorage } from './CharacterDetailStorage';
import { CharacterDetailTrackers } from './CharacterDetailTrackers';
import { useCurrentCharacter } from './context';

const abilityStyle: StackProps = {
  flexBasis: ['50%', '33%'],
  flexGrow: 1,
  flexShrink: 1,
  borderRight: '1px',
  borderBottom: '1px',
  borderColor: 'gray.200',
};

const hStackForBonusStyle = {
  w: 'full',
  justifyContent: 'stretch',
  spacing: '0',
};

export function CharacterDetailBasic(): JSX.Element {
  const character = useCurrentCharacter();
  const manualEffectsState = useDisclosure();

  function showAbility(t: AbilityType) {
    return (
      <NamedBonusPopover bonuses={character.getBonusesForAbilityType(t, true)}>
        <HStack p="2">
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
        </HStack>
      </NamedBonusPopover>
    );
  }

  return (
    <>
      <Box position="relative">
        <HStack position="absolute" right="0" top="-10">
          <Button size="sm" onClick={() => manualEffectsState.onOpen()}>
            手动效果
          </Button>
          <Button
            as={Link}
            to={`/player/character/${character.id}/upgrade`}
            colorScheme="teal"
            size="sm"
          >
            升级
          </Button>
        </HStack>
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
                    <VBlockItemForBonus label="速度" bonuses={character.status.speedBonuses}>
                      {character.status.speed}
                    </VBlockItemForBonus>
                  </Block>
                </Box>
                <Box w="50%">
                  <Block>
                    <VBlockItem label="职业" overflowX="hidden">
                      {character.levelDetailForShow.map((t) => (
                        <Box key={t}>{t}</Box>
                      ))}
                    </VBlockItem>
                    <VBlockItem label="阵营">{alignmentTranslates[character.alignment]}</VBlockItem>
                    <VBlockItem
                      label={
                        <span>
                          信仰 <Icon as={FaPen} boxSize="12px" verticalAlign="baseline" />
                        </span>
                      }
                    >
                      <Input
                        textAlign="right"
                        value={character.deity}
                        onChange={(e) => {
                          character.deity = e.target.value;
                        }}
                        variant="unstyled"
                        borderRadius="0"
                      />
                    </VBlockItem>
                  </Block>
                </Box>
              </HStack>

              <Box flex="1" w={['full', 'auto']}>
                <Block>
                  <HStack spacing="0" flexWrap="wrap">
                    <Box {...abilityStyle}>{showAbility(AbilityType.str)}</Box>
                    <Box {...abilityStyle} borderRightWidth={['0px', '1px']}>
                      {showAbility(AbilityType.dex)}
                    </Box>
                    <Box {...abilityStyle} borderRightWidth={['1px', '0px']}>
                      {showAbility(AbilityType.con)}
                    </Box>
                    <Box
                      {...abilityStyle}
                      borderRightWidth={['0px', '1px']}
                      borderBottomWidth={['1px', '0px']}
                    >
                      {showAbility(AbilityType.int)}
                    </Box>
                    <Box {...abilityStyle} borderBottomWidth="0px">
                      {showAbility(AbilityType.wis)}
                    </Box>
                    <Box {...abilityStyle} borderRightWidth="0px" borderBottomWidth="0px">
                      {showAbility(AbilityType.cha)}
                    </Box>
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

                    <HBlockItemForBonus label="察觉" bonuses={character.status.perceptionBonuses}>
                      {showModifier(character.status.perception)}
                    </HBlockItemForBonus>
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
              <Box flexBasis={['50%', '100%']}>
                <Block p="2" h="full">
                  <BlockHeading>攻击</BlockHeading>
                  <CharacterDetailAttackOptions />
                </Block>
              </Box>
              <Box flexBasis={['50%', '100%']}>
                <Block p="2" h="full">
                  <BlockHeading>技能</BlockHeading>
                  <CharacterDetailSkills />
                </Block>
              </Box>
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
                  <BlockHeading>
                    <HStack alignItems="flex-end">
                      <Text>背包</Text>
                      <Text fontSize="x-small" color="gray.600" fontWeight="normal">
                        {showCoin(character.equipment.storageCostWeight.cost)} /{' '}
                        {showWeight(character.equipment.storageCostWeight.weight)}
                        {carryLoadTranslates[character.status.carryLoad]}
                      </Text>
                    </HStack>
                  </BlockHeading>
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
              </Stack>
            ))}

            {character.tracker.trackers.length > 0 ? (
              <Stack direction={['column', 'row']}>
                <Box flexBasis={['50%', '100%']}>
                  <Block p="2" h="full">
                    <BlockHeading>Trackers</BlockHeading>
                    <CharacterDetailTrackers />
                  </Block>
                </Box>
              </Stack>
            ) : null}

            {Array.from(character.allGainedClassFeats.entries()).map(([clas, feats]) => {
              const archetypes: string = character
                .getArchetypesForClass(clas)
                .map((a) => a.name)
                .join(', ');

              return (
                <Block p="2" key={clas.id}>
                  <BlockHeading>
                    {character.getLevelForClass(clas)}级{clas.name}
                    {archetypes ? <small>({archetypes})</small> : ''}
                  </BlockHeading>
                  <CharacterDetailFeats
                    entitiesWithInput={uniqByLast(
                      feats.map((f) => ({
                        entity: f,
                        input: character.effect.getEffectInputForClassFeat(clas, f),
                      })),
                      (fi) => {
                        if (fi.input) return fi.entity;

                        return fi.entity.origin ?? fi.entity;
                      }
                    )}
                  />
                </Block>
              );
            })}

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

      <CharacterDetailManualEffectsModal
        isOpen={manualEffectsState.isOpen}
        onClose={manualEffectsState.onClose}
      />
    </>
  );
}

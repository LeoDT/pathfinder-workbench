import { memo } from 'react';

import {
  Box,
  Heading,
  Table,
  TableCaption,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';

import { ENTITY_COLORS } from '../constant';
import { useStore } from '../store';
import { Class as ClassType } from '../types/core';
import { alignmentTranslates } from '../utils/alignment';
import { showDice } from '../utils/misc';
import { showModifier, showModifiers } from '../utils/modifier';
import { translateSkill } from '../utils/skill';
import { DescriptionTable, convertRecordToDescriptions } from './DescriptionTable';

interface Props {
  clas: ClassType;
}

export function Class({ clas }: Props): JSX.Element {
  const { collections } = useStore();
  const spellsPerDay = clas.levels.map((l) => l.spellsPerDay).filter((s) => s);
  const spellsKnown = clas.levels.map((l) => l.spellsKnown).filter((s) => s);

  return (
    <Box className="spell">
      <Heading as="h4" fontSize="lg" color={ENTITY_COLORS.class}>
        {clas.name} {<small style={{ fontWeight: 'normal' }}>({clas.id})</small>}
      </Heading>
      <DescriptionTable
        descriptions={convertRecordToDescriptions({
          ...clas.desc,
          生命骰: showDice(clas.hd),
          阵营: clas.alignment.length
            ? clas.alignment.map((a) => alignmentTranslates[a]).join(', ')
            : '任意',
          本职技能: clas.classSkills.map((s) => translateSkill(s)).join(', '),
          技能点: clas.skillPoints,
        })}
      />

      <Table variant="striped" colorScheme="gray" size="sm" borderTop="1px" borderColor="gray.200">
        <TableCaption placement="top">职业等级表</TableCaption>
        <Thead>
          <Tr>
            <Th>等级</Th>
            <Th>BAB</Th>
            <Th>强韧</Th>
            <Th>反射</Th>
            <Th>意志</Th>
            <Th w="40%">特性</Th>
          </Tr>
        </Thead>
        <Tbody>
          {clas.levels.map((l, i) => (
            <Tr key={i}>
              <Td>{l.level}</Td>
              <Td>{showModifiers(l.bab)}</Td>
              <Td>{showModifier(l.fortitude)}</Td>
              <Td>{showModifier(l.reflex)}</Td>
              <Td>{showModifier(l.will)}</Td>
              <Td>
                {collections.class
                  .getClassFeatsByLevel(clas, i + 1)
                  .map((f) => f.name)
                  .join(', ')}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {spellsPerDay.length ? (
        <Table
          variant="striped"
          colorScheme="gray"
          size="sm"
          borderTop="1px"
          borderColor="gray.200"
          width="auto"
        >
          <TableCaption placement="top">每日法术</TableCaption>
          <Thead>
            <Tr>
              <Th>等级</Th>
              {spellsPerDay[0]?.map((l, i) => (
                <Th key={i}>{i}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {spellsPerDay.map((s, i) => (
              <Tr key={i}>
                <Td>{i + 1}</Td>
                {s?.map((n, j) => (
                  <Td key={j}>{n === 0 ? '-' : n}</Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : null}

      {spellsKnown.length ? (
        <Table
          variant="striped"
          colorScheme="gray"
          size="sm"
          borderTop="1px"
          borderColor="gray.200"
          width="auto"
        >
          <TableCaption placement="top">法术可知数量</TableCaption>
          <Thead>
            <Tr>
              <Th>等级</Th>
              {spellsKnown[0]?.map((l, i) => (
                <Th key={i}>{i}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {spellsKnown.map((s, i) => (
              <Tr key={i}>
                <Td>{i + 1}</Td>
                {s?.map((n, j) => (
                  <Td key={j}>{n === 0 ? '-' : n}</Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : null}

      <Box>
        {clas.feats.map((f) => (
          <Box
            key={f.id}
            p="2"
            border="1px"
            borderColor="gray.200"
            mb="2"
            borderRadius="md"
            _first={{ mt: '4' }}
          >
            <Heading as="h5" color={ENTITY_COLORS.classFeat} fontSize="lg" mb="2">
              {f.name} <small>({f.id})</small>
            </Heading>
            <Text dangerouslySetInnerHTML={{ __html: f.desc }} whiteSpace="pre-wrap" />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

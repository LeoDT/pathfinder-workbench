import './Feat.scss';

import { memo } from 'react';

import { Badge, Box, HStack, Heading, Table, Tbody, Td, Text, Tr } from '@chakra-ui/react';

import { ENTITY_COLORS } from '../constant';
import { FeatMeta as FeatMetaType, Feat as FeatType } from '../types/core';
import { featTranslates, featTypeTranslates } from '../utils/feat';

interface Props {
  feat: FeatType;
  showName?: boolean;
  showBrief?: boolean;
  showMeta?: boolean;
  showDescription?: boolean;
  showId?: boolean;
}

function FeatMeta({ feat }: { feat: FeatType }) {
  const type = feat.type.map((t) => featTypeTranslates[t]).join(', ');

  return (
    <Table size="sm" mt="2">
      <Tbody>
        {type ? (
          <Tr>
            <Td pl="0" color="blue.500" width="8em">
              类型
            </Td>
            <Td>{type}</Td>
          </Tr>
        ) : null}
        {(Object.keys(feat.meta) as Array<keyof FeatMetaType>).map((k) => (
          <Tr key={k}>
            <Td pl="0" color="blue.500" width="8em">
              {featTranslates[k]}
            </Td>
            <Td>{feat.meta[k]}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

export function RawFeat({
  feat,
  showName = true,
  showBrief = true,
  showMeta = true,
  showDescription = true,
  showId = false,
}: Props): JSX.Element {
  return (
    <Box className="feat">
      {showName ? (
        <HStack direction="row" align="center">
          <Badge>{feat.book.toUpperCase()}</Badge>
          <Heading as="h4" fontSize="lg" color={ENTITY_COLORS.feat}>
            {feat.name}{' '}
            {showId ? <small style={{ fontWeight: 'normal' }}>({feat.id})</small> : null}
          </Heading>
        </HStack>
      ) : null}

      {showBrief && feat.brief ? (
        <Text mt="2" fontStyle="italic">
          {feat.brief}
        </Text>
      ) : null}

      {showMeta ? <FeatMeta feat={feat} /> : null}

      {showDescription && feat.desc ? (
        <Text
          pt="1"
          whiteSpace="pre-wrap"
          dangerouslySetInnerHTML={{ __html: feat.desc }}
          className="feat-description"
        />
      ) : null}
    </Box>
  );
}

export const Feat = memo(RawFeat);

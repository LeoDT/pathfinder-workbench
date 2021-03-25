import './Feat.scss';

import { memo } from 'react';
import { Box, HStack, Badge, Heading, Table, Tbody, Tr, Td, Text } from '@chakra-ui/react';

import { ENTITY_COLORS } from '../constant';
import { Feat as FeatType, FeatMeta as FeatMetaType } from '../types/core';
import { featTranslates } from '../utils/feat';

interface Props {
  feat: FeatType;
  showName?: boolean;
  showBrief?: boolean;
  showMeta?: boolean;
  showDescription?: boolean;
}

function FeatMeta({ feat }: { feat: FeatType }) {
  return (
    <Table size="sm" mt="2">
      <Tbody>
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

export function Feat({
  feat,
  showName = true,
  showBrief = true,
  showMeta = true,
  showDescription = true,
}: Props): JSX.Element {
  return (
    <Box className="feat">
      {showName ? (
        <HStack direction="row" align="center">
          <Badge>{feat.book.toUpperCase()}</Badge>
          <Heading as="h4" fontSize="lg" color={ENTITY_COLORS.feat}>
            {feat.name} <small style={{ fontWeight: 'normal' }}>({feat.id})</small>
          </Heading>
        </HStack>
      ) : null}

      {showBrief ? (
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

export default memo(Feat);

import './Feat.scss';

import { Box, HStack, Badge, Heading, Table, Tbody, Tr, Td, Text } from '@chakra-ui/react';

import { Feat as FeatType, FeatMeta as FeatMetaType } from '../store/types';
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

export default function Feat({
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
          <Heading as="h4" fontSize="lg" color="red.600">
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

      {showDescription && feat.description ? (
        <Text
          pt="1"
          whiteSpace="pre-wrap"
          dangerouslySetInnerHTML={{ __html: feat.description }}
          className="feat-description"
        />
      ) : null}
    </Box>
  );
}

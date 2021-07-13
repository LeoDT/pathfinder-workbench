import { Table, Tbody, Td, Tr } from '@chakra-ui/react';

interface Props {
  descriptions: Array<{
    key: string;
    value: string;
  }>;
}

export function DescriptionTable({ descriptions }: Props): JSX.Element {
  return (
    <Table size="sm">
      <Tbody>
        {descriptions.map(({ key, value }) => {
          return (
            <Tr key={key}>
              <Td pl="0" color="blue.500" width="8em" verticalAlign="top">
                {key}
              </Td>
              <Td>{value}</Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
}

export function convertRecordToDescriptions(
  o: Record<string, string | number>
): Array<{ key: string; value: string }> {
  return Array.from(Object.entries(o)).map(([k, v]) => ({
    key: k.toString(),
    value: v.toString(),
  }));
}

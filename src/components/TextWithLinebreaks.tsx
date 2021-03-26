import { Box, Text, BoxProps, TextProps } from '@chakra-ui/layout';
import { useMemo } from 'react';

interface Props extends BoxProps {
  text: string;
  textProps?: TextProps;
}

export default function TextWithLinebreaks({ text, textProps, ...props }: Props): JSX.Element {
  const converted = useMemo(() => text.split('\n'), [text]);

  return (
    <Box {...props}>
      {converted.map((t, i) => (
        <Text key={i} {...textProps}>
          {t}
        </Text>
      ))}
    </Box>
  );
}

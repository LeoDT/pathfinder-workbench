import { isEqual, last } from 'lodash-es';
import { Fragment, useCallback } from 'react';
import { FaCheck, FaChevronDown } from 'react-icons/fa';

import {
  Button,
  HStack,
  Icon,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Spacer,
  Text,
  useDisclosure,
} from '@chakra-ui/react';

import { SpecialFeat } from '../types/core';
import { EntityQuickViewerToggler } from './EntityQuickViewer';

interface Props {
  feat: SpecialFeat;
  value: string[];
  onChange: (v: string[]) => void;
  parseFormulaBoolean?: (s: string) => boolean;
  hasSubs: (s: string[]) => boolean;
  quickViewer?: boolean;
}

export function SubsSelector({
  feat,
  value,
  onChange,
  parseFormulaBoolean,
  hasSubs,
  quickViewer = true,
}: Props): JSX.Element {
  const renderSubs = useCallback(
    (root: SpecialFeat) => {
      function render(parents: SpecialFeat[], level = 1): JSX.Element {
        return (
          <>
            {last(parents)?.subs?.map((item) => {
              const disabled =
                item.subs ||
                (item.when && parseFormulaBoolean ? !parseFormulaBoolean(item.when) : false);
              const id =
                level > 1
                  ? `${parents
                      .slice(1)
                      .map((p) => p.id)
                      .join('-')}-${item.id}`
                  : item.id;
              const itemValue =
                level > 1
                  ? parents
                      .slice(1)
                      .map((p) => p.id)
                      .concat(item.id)
                  : [item.id];
              const picked = isEqual(itemValue, value);

              if (hasSubs(itemValue)) return null;

              return (
                <Fragment key={id}>
                  <HStack
                    key={id}
                    onClick={() => {
                      if (!disabled) {
                        onChange(itemValue);
                      }
                    }}
                    p="2"
                    pl={(level * 2).toString()}
                    borderBottom="1px"
                    borderColor="gray.200"
                    _hover={{
                      background: 'gray.100',
                    }}
                    opacity={disabled ? 0.6 : 1}
                    cursor={disabled ? 'not-allowed' : 'pointer'}
                  >
                    {picked ? <Icon as={FaCheck} /> : null}

                    <Text>
                      {item.name || item.id} {item.subs ? <small>(选择子项)</small> : null}
                    </Text>

                    <Spacer />
                    {quickViewer ? <EntityQuickViewerToggler entity={item} /> : null}
                  </HStack>
                  {item.subs ? render(parents.concat(item), level + 1) : null}
                </Fragment>
              );
            })}
          </>
        );
      }

      return render([root]);
    },
    [feat, value, parseFormulaBoolean, onChange]
  );

  return <div className="subs-selector">{renderSubs(feat)}</div>;
}

export interface PopoverProps extends Props {
  text: string;
  textWithArrow?: boolean;
  togglerDisabled?: boolean;
}

export function SubsSelectorPopover({
  text,
  textWithArrow,
  togglerDisabled,
  ...props
}: PopoverProps): JSX.Element {
  const { isOpen, onClose, onToggle } = useDisclosure();

  return (
    <Popover placement="bottom-start" isOpen={isOpen} onClose={onClose} isLazy>
      <PopoverTrigger>
        <Button disabled={togglerDisabled} onClick={onToggle}>
          <HStack>
            {typeof text === 'string' ? <Text>{text}</Text> : text}
            {textWithArrow ? <Icon as={FaChevronDown} display="inine-block" /> : null}
          </HStack>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverBody>
          <SubsSelector {...props} />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

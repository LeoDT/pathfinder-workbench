import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  HStack,
  Button,
  useDisclosure,
  Box,
  Wrap,
  WrapItem,
  ButtonProps,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';

import { useStore } from '../store';

import { EntityType, EquipmentType, Equipment, RaceSize } from '../types/core';
import { equipmentTypeTranslates } from '../utils/equipment';

import Select from './Select';
import SimpleEntity from './SimpleEntity';
import { CollectionEntityPickerPopover } from './CollectionEntityPicker';
import CreateEquipmentForm from './CreateEquipmentForm';

interface Props {
  onCreate: (e: Equipment) => void;
  onCancel?: () => void;
  characterSize: RaceSize;
}

const equipmentTypeOptions: Array<{ text: string; value: EquipmentType }> = [
  { text: equipmentTypeTranslates.weapon, value: 'weapon' },
  { text: equipmentTypeTranslates.armor, value: 'armor' },
];

export default function CreateEquipment({ onCreate, onCancel, characterSize }: Props): JSX.Element {
  const store = useStore();
  const [equipmentType, setEquipmentType] = useState<EquipmentType>('weapon');
  const [equipment, setEquipment] = useState<{ id: string; type: EquipmentType } | null>(null);
  const collection = useMemo(() => {
    switch (equipmentType) {
      case 'weapon':
        return store.collections.weaponType;
      case 'armor':
        return store.collections.armorType;
    }
  }, [equipmentType]);
  const entityForEquipment = useMemo(() => {
    return equipment ? collection.getById(equipment.id) : null;
  }, [collection, equipment]);
  const entityTypeForEquipment = useMemo<EntityType | null>(() => {
    switch (equipment?.type) {
      case 'weapon':
        return 'weaponType';
      case 'armor':
        return 'armorType';
      default:
        return null;
    }
  }, [equipment]);
  const [created, setCreated] = useState<Equipment | null>(null);

  return (
    <Box>
      <Wrap mb="4" alignItems="center">
        <WrapItem>
          <Select
            options={equipmentTypeOptions}
            value={equipmentType}
            onChange={(v) => {
              setEquipmentType(v);
              setEquipment(null);
            }}
          />
        </WrapItem>
        <WrapItem>
          <CollectionEntityPickerPopover
            collection={collection}
            items={equipment ? [equipment.id] : []}
            onPick={(id) => {
              setEquipment({ id, type: equipmentType });
            }}
            text={`选择${equipmentTypeTranslates[equipmentType]}`}
          />
        </WrapItem>
        <WrapItem>
          {entityForEquipment && entityTypeForEquipment ? (
            <SimpleEntity entity={entityForEquipment} />
          ) : null}
        </WrapItem>
      </Wrap>

      {entityForEquipment ? (
        <Box w={['full', '60%']}>
          <CreateEquipmentForm
            key={entityForEquipment.id}
            onCreate={(e) => setCreated(e)}
            proto={entityForEquipment}
            size={characterSize}
          />
        </Box>
      ) : null}

      <HStack justifyContent="flex-end" py="2">
        <Button onClick={onCancel}>取消</Button>
        <Button
          colorScheme="teal"
          isDisabled={!created}
          onClick={() => {
            if (created) {
              onCreate(created);
            }
          }}
        >
          确认
        </Button>
      </HStack>
    </Box>
  );
}

interface TogglerProps extends Props {
  buttonProps?: ButtonProps;
  title?: string;
}

export function CreateEquipmentToggler({
  buttonProps,
  title = '添加物品',
  onCreate,
  ...props
}: TogglerProps): JSX.Element {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button onClick={onOpen} {...buttonProps}>
        {buttonProps?.children || '添加物品'}
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <CreateEquipment
              onCancel={onClose}
              onCreate={(e) => {
                onCreate(e);
                onClose();
              }}
              {...props}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

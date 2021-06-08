import { Collection } from '../store/collection';
import { Entity } from '../types/core';
import EntityPicker, {
  EntityPickerPopover,
  PopoverProps as EntityPickerPopoverProps,
  Props as EntityPickerProps,
} from './EntityPicker';

interface Props<T extends Entity> extends Omit<EntityPickerProps<T>, 'fuse'> {
  collection: Collection<T>;
}

export default function CollectionEntityPicker<T extends Entity>({
  collection,
  ...props
}: Props<T>): JSX.Element {
  return <EntityPicker fuse={collection.fuse} entities={collection.data} {...props} />;
}

interface PopoverProps<T extends Entity> extends Omit<EntityPickerPopoverProps<T>, 'fuse'> {
  collection: Collection<T>;
}

export function CollectionEntityPickerPopover<T extends Entity>({
  collection,
  ...props
}: PopoverProps<T>): JSX.Element {
  return <EntityPickerPopover fuse={collection.fuse} entities={collection.data} {...props} />;
}

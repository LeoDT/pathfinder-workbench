import { Collection } from '../store/collection';

import EntityPicker, {
  EntityPickerPopover,
  Props as EntityPickerProps,
  PopoverProps as EntityPickerPopoverProps,
} from './EntityPicker';

interface Props extends Omit<EntityPickerProps, 'fuse'> {
  collection: Collection;
}

export default function CollectionEntityPicker({ collection, ...props }: Props): JSX.Element {
  return <EntityPicker fuse={collection.fuse} {...props} />;
}

interface PopoverProps extends Omit<EntityPickerPopoverProps, 'fuse'> {
  collection: Collection;
}

export function CollectionEntityPickerPopover({ collection, ...props }: PopoverProps): JSX.Element {
  return <EntityPickerPopover fuse={collection.fuse} {...props} />;
}

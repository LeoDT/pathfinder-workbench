import { useCreateCharacterStore } from '../../store/createCharacter';
import { CreateOrUpgradeCharacterFinish } from './CreateOrUpgradeCharacterFinish';

export function CreateCharacterFeat(): JSX.Element {
  const create = useCreateCharacterStore();

  return <CreateOrUpgradeCharacterFinish createOrUpgrade={create} />;
}

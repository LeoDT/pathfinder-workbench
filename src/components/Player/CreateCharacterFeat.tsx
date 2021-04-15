import { useCreateCharacterStore } from '../../store/createCharacter';
import CreateOrUpgradeCharacterFeat from './CreateOrUpgradeCharacterFeat';

export default function CreateCharacterFeat(): JSX.Element {
  const create = useCreateCharacterStore();

  return <CreateOrUpgradeCharacterFeat createOrUpgrade={create} showRaceTraits={true} />;
}

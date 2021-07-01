import { useCreateCharacterStore } from '../../store/createCharacter';
import { CreateOrUpgradeCharacterSpell } from './CreateOrUpgradeCharacterSpell';

export function CreateCharacterSpell(): JSX.Element {
  const create = useCreateCharacterStore();

  return <CreateOrUpgradeCharacterSpell createOrUpgrade={create} />;
}

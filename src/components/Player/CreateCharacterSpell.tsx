import { useCreateCharacterStore } from '../../store/createCharacter';

import CreateOrUpgradeCharacterSpell from './CreateOrUpgradeCharacterSpell';

export default function CreateCharacterSpell(): JSX.Element {
  const create = useCreateCharacterStore();

  return <CreateOrUpgradeCharacterSpell createOrUpgrade={create} />;
}

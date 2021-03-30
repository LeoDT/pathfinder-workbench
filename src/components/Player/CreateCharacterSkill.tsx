import { useCreateCharacterStore } from '../../store/createCharacter';

import CreateOrUpgradeCharacterSkill from './CreateOrUpgradeCharacterSkill';

export default function CreateCharacterSkills(): JSX.Element {
  const create = useCreateCharacterStore();

  return <CreateOrUpgradeCharacterSkill createOrUpgrade={create} />;
}

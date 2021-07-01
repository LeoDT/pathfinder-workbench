import { useCreateCharacterStore } from '../../store/createCharacter';
import { CreateCharacterSkills as CreateOrUpgradeCharacterSkill } from './CreateOrUpgradeCharacterSkill';

export function CreateCharacterSkills(): JSX.Element {
  const create = useCreateCharacterStore();

  return <CreateOrUpgradeCharacterSkill createOrUpgrade={create} />;
}

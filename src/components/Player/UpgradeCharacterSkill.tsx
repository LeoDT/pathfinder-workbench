import { useUpgradeCharacterStore } from '../../store/upgradeCharacter';
import { CreateCharacterSkills as CreateOrUpgradeCharacterSkill } from './CreateOrUpgradeCharacterSkill';

export function UpgradeCharacterSkills(): JSX.Element {
  const upgrade = useUpgradeCharacterStore();

  return <CreateOrUpgradeCharacterSkill createOrUpgrade={upgrade} />;
}

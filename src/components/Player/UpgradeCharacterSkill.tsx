import { useUpgradeCharacterStore } from '../../store/upgradeCharacter';

import CreateOrUpgradeCharacterSkill from './CreateOrUpgradeCharacterSkill';

export default function UpgradeCharacterSkills(): JSX.Element {
  const upgrade = useUpgradeCharacterStore();

  return <CreateOrUpgradeCharacterSkill createOrUpgrade={upgrade} />;
}

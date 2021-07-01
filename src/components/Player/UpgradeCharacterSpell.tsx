import { useUpgradeCharacterStore } from '../../store/upgradeCharacter';
import { CreateOrUpgradeCharacterSpell } from './CreateOrUpgradeCharacterSpell';

export function UpgradeCharacterSpell(): JSX.Element {
  const upgrade = useUpgradeCharacterStore();

  return <CreateOrUpgradeCharacterSpell createOrUpgrade={upgrade} />;
}

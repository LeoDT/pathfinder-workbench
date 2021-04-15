import { useUpgradeCharacterStore } from '../../store/upgradeCharacter';
import CreateOrUpgradeCharacterFeat from './CreateOrUpgradeCharacterFeat';

export default function UpgradeCharacterFeat(): JSX.Element {
  const upgrade = useUpgradeCharacterStore();

  return <CreateOrUpgradeCharacterFeat createOrUpgrade={upgrade} showRaceTraits={false} />;
}

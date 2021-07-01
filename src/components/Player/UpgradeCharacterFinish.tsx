import { useUpgradeCharacterStore } from '../../store/upgradeCharacter';
import { CreateOrUpgradeCharacterFinish } from './CreateOrUpgradeCharacterFinish';

export function UpgradeCharacterFeat(): JSX.Element {
  const upgrade = useUpgradeCharacterStore();

  return <CreateOrUpgradeCharacterFinish createOrUpgrade={upgrade} />;
}

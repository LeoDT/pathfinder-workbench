import { useUpgradeCharacterStore } from '../../store/upgradeCharacter';

import CreateOrUpgradeCharacterFinish from './CreateOrUpgradeCharacterFinish';

export default function UpgradeCharacterFeat(): JSX.Element {
  const upgrade = useUpgradeCharacterStore();

  return <CreateOrUpgradeCharacterFinish createOrUpgrade={upgrade} />;
}

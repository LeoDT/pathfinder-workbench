import { useMemo } from 'react';
import { ClassSpeciality, ClassSpecialityType } from '../types/characterUpgrade';
import { EffectGainClassSpeciality } from '../types/effectType';
import { getClassSpecialityTypeFromEffect } from '../utils/class';

import ArcaneSchoolPicker from './ArcaneSchoolPicker';

interface Props {
  effect: EffectGainClassSpeciality;
  value: ClassSpeciality | null;
  onChange: (v: ClassSpeciality) => void;
}

export default function ClassSpecialityPickerToggler({
  value,
  onChange,
  effect,
}: Props): JSX.Element | null {
  const specialityType = useMemo(() => getClassSpecialityTypeFromEffect(effect), [effect]);

  switch (specialityType) {
    case ClassSpecialityType.arcaneSchool:
      return (
        <ArcaneSchoolPicker
          value={value}
          onChange={onChange}
          standardForbidden={effect.standardForbidden}
        />
      );
    default:
      return null;
  }
}

import { HStack, Badge } from '@chakra-ui/react';
import { useStore } from '../store';
import { ClassSpeciality, ClassSpecialityType } from '../types/characterUpgrade';

interface Props {
  classSpeciality: ClassSpeciality;
}

export default function ClassSpecialityDisplayer({
  classSpeciality: cs,
}: Props): JSX.Element | null {
  const { collections } = useStore();

  switch (cs.type) {
    case ClassSpecialityType.arcaneSchool: {
      const school = collections.arcaneSchool.getById(cs.school);
      const forbidden = cs.forbiddenSchool.map((s) => collections.arcaneSchool.getById(s));
      const focused =
        school.type === 'standard' && cs.focused
          ? school.focused.find((f) => f.id === cs.focused)
          : undefined;

      return (
        <HStack>
          <Badge fontSize="md" colorScheme="blue">
            {focused ? focused.name : school.name}
          </Badge>
          {forbidden.map((s) => (
            <Badge fontSize="md" key={s.id} colorScheme="red">
              {s.name}
            </Badge>
          ))}
        </HStack>
      );
    }

    default:
      return null;
  }
}

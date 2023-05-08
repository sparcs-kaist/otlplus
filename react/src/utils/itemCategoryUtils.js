export const CategoryFirstIndex = {
  TOTAL: -1,
  BASIC: 0,
  MAJOR: 1,
  RESEARCH: 2,
  GENERAL_AND_HUMANITY: 3,
  OTHERS: 4,
};

export const isIdenticalCategory = (category1, category2) => (
  category1
  && category2
  && category1[0] === category2[0]
  && category1[1] === category2[1]
  && category1[2] === category2[2]
);

export const getSeparateMajorTracks = (planner) => {
  if (!planner) {
    return [];
  }

  return [
    planner.major_track,
    ...(
      planner.additional_tracks
        .filter((at) => (at.type === 'DOUBLE'))
    ),
    ...(
      planner.additional_tracks
        .filter((at) => (at.type === 'MINOR'))
    ),
    ...(
      planner.additional_tracks
        .filter((at) => (at.type === 'INTERDISCIPLINARY'))
    ),
  ];
};

export const getCategoryOfType = (planner, type, departmentCode) => {
  switch (type) {
    case 'Basic Required':
      return [CategoryFirstIndex.BASIC, 0, 0];
    case 'Basic Elective':
      return [CategoryFirstIndex.BASIC, 0, 1];
    case 'Major Required': {
      const separateMajorTracks = getSeparateMajorTracks(planner);
      const targetTrack = (
        separateMajorTracks.find((smt) => (smt.department?.code === departmentCode))
        || separateMajorTracks.find((smt) => (smt.type === 'INTERDISCIPLINARY'))
      );
      if (targetTrack) {
        const secondIndex = separateMajorTracks.findIndex((smt) => (smt.id === targetTrack.id));
        return [CategoryFirstIndex.MAJOR, secondIndex, 0];
      }
      break;
    }
    case 'Major Elective':
    case 'Elective(Graduate)': {
      const separateMajorTracks = getSeparateMajorTracks(planner);
      const targetTrack = (
        separateMajorTracks.find((smt) => (smt.department?.code === departmentCode))
        || separateMajorTracks.find((smt) => (smt.type === 'INTERDISCIPLINARY'))
      );
      if (targetTrack) {
        const secondIndex = separateMajorTracks.findIndex((smt) => (smt.id === targetTrack.id));
        return [CategoryFirstIndex.MAJOR, secondIndex, 1];
      }
      break;
    }
    case 'Thesis Study(Undergraduate)':
      return [CategoryFirstIndex.RESEARCH, 0, 0];
    case 'Individual Study':
      return [CategoryFirstIndex.RESEARCH, 0, 1];
    case 'General Required':
    case 'Mandatory General Courses':
      return [CategoryFirstIndex.GENERAL_AND_HUMANITY, 0, 0];
    case 'Humanities & Social Elective':
      return [CategoryFirstIndex.GENERAL_AND_HUMANITY, 0, 1];
    case 'Other Elective':
      return [CategoryFirstIndex.OTHERS, 0, 0];
    default:
      break;
  }
  if (type?.startsWith('Humanities & Social Elective')) {
    return [CategoryFirstIndex.GENERAL_AND_HUMANITY, 0, 1];
  }
  return [CategoryFirstIndex.OTHERS, 0, 1];
};

export const getCategoryOfItem = (planner, item) => {
  switch (item.item_type) {
    case ('TAKEN'):
      return getCategoryOfType(planner, item.lecture.type_en, item.lecture.department_code);
    case ('FUTURE'):
      return getCategoryOfType(planner, item.course.type_en, item.course.department.code);
    case ('ARBITRARY'):
      return getCategoryOfType(planner, item.type_en, item.department?.code);
    default:
      return getCategoryOfType(planner, '', '');
  }
};

export const getColorOfCategory = (planner, category) => {
  switch (category[0]) {
    case 0:
      return 1;
    case 1:
      return 3 + ((category[1] * 2) % 7);
    case 2:
      return 11;
    case 3:
      return 14;
    case 4:
      return 17;
    default:
      return 17;
  }
};

export const getColorOfItem = (planner, item) => {
  return getColorOfCategory(planner, getCategoryOfItem(planner, item));
};

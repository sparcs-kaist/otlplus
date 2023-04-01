
export const getYearOfItem = (item) => {
  switch (item.item_type) {
    case 'TAKEN':
      return item.lecture.year;
    case 'FUTURE':
      return item.year;
    case 'ARBITRARY':
      return item.year;
    default:
      return 2000;
  }
};

export const getSemesterOfItem = (item) => {
  switch (item.item_type) {
    case 'TAKEN':
      return item.lecture.semester;
    case 'FUTURE':
      return item.semester;
    case 'ARBITRARY':
      return item.semester;
    default:
      return 2000;
  }
};

export const getDefaultCreditOfItem = (item) => {
  if (item.item_type === 'TAKEN') {
    return item.lecture.credit;
  }
  if (item.item_type === 'FUTURE') {
    return item.course.credit;
  }
  if (item.item_type === 'ARBITRARY') {
    return item.credit;
  }
  return 0;
};

export const getCreditOfItem = (item) => {
  return getDefaultCreditOfItem(item); // TODO: Implement additional customization
};

export const getAuOfItem = (item) => {
  if (item.item_type === 'TAKEN') {
    return item.lecture.credit_au;
  }
  if (item.item_type === 'FUTURE') {
    return item.course.credit_au;
  }
  if (item.item_type === 'ARBITRARY') {
    return item.credit_au;
  }
  return 0;
};

export const getCreditAndAuOfItem = (item) => {
  return getCreditOfItem(item) + getAuOfItem(item);
};

export const getSeparateMajorTracks = (planner) => {
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

export const getCategoryOfType = (planner, type, department) => {
  switch (type) {
    case 'Basic Required':
      return [0, 0, 0];
    case 'Basic Elective':
      return [0, 0, 1];
    case 'Major Required': {
      const separateMajorTracks = getSeparateMajorTracks(planner);
      const targetTrack = (
        separateMajorTracks.find((smt) => (smt.department?.id === department.id))
        || separateMajorTracks.find((smt) => (smt.type === 'INTERDISCIPLINARY'))
      );
      if (targetTrack) {
        return [1, separateMajorTracks.findIndex((smt) => (smt.id === targetTrack.id)), 0];
      }
      break;
    }
    case 'Major Elective':
    case 'Elective(Graduate)': {
      const separateMajorTracks = getSeparateMajorTracks(planner);
      const targetTrack = (
        separateMajorTracks.find((smt) => (smt.department?.id === department.id))
        || separateMajorTracks.find((smt) => (smt.type === 'INTERDISCIPLINARY'))
      );
      if (targetTrack) {
        return [1, separateMajorTracks.findIndex((smt) => (smt.id === targetTrack.id)), 1];
      }
      break;
    }
    case 'Thesis Study(Undergraduate)':
      return [2, 0, 0];
    case 'Individual Study':
      return [2, 0, 1];
    case 'General Required':
    case 'Mandatory General Courses':
      return [3, 0, 0];
    case 'Humanities & Social Elective':
      return [3, 0, 1];
    case 'Other Elective':
      return [4, 0, 0];
    default:
      break;
  }
  if (type?.startsWith('Humanities & Social Elective')) {
    return [3, 0, 1];
  }
  return [4, 0, 1];
};

export const getCategoryOfItem = (planner, item) => {
  switch (item.item_type) {
    case ('TAKEN'):
      return getCategoryOfType(planner, item.lecture.type_en, item.lecture.department);
    case ('FUTURE'):
      return getCategoryOfType(planner, item.course.type_en, item.course.department);
    case ('ARBITRARY'):
      return getCategoryOfType(planner, item.type_en, item.department);
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

export const getIdOfArbitrary = (type, typeEn, department) => {
  if (department) {
    if (typeEn.endsWith('Required')) {
      return -(department.id * 100 + 1);
    }
    if (typeEn.endsWith('Elective')) {
      return -(department.id * 100 + 2);
    }
    return -(department.id * 100 + 3);
  }
  return -991;
};

export const getTitleOfArbitrary = (type, typeEn, department) => {
  return `임의의 ${type}`;
};

export const getTitleEnOfArbitrary = (type, typeEn, department) => {
  return `Arbitrary ${typeEn}`;
};

export const getOldCodeOfArbitrary = (type, typeEn, department) => {
  if (typeEn.startsWith('Major')) {
    return `${department.code}---`;
  }
  return 'HSS---';
};

export const getCourseOfItem = (item) => {
  switch (item.item_type) {
    case ('TAKEN'):
      return item.course;
    case ('FUTURE'):
      return item.course;
    case ('ARBITRARY'):
      return {
        id: getIdOfArbitrary(item.type, item.type_en, item.department),
        isArbitrary: true,
        department: item.department,
        type: item.type,
        type_en: item.type_en,
        credit: item.credit,
        credit_au: item.credit_au,
        title: getTitleOfArbitrary(item.type, item.type_en, item.department),
        title_en: getTitleEnOfArbitrary(item.type, item.type_en, item.department),
        old_code: getOldCodeOfArbitrary(item.type, item.type_en, item.department),
      };
    default:
      return null;
  }
};

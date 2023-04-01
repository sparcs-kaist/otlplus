import { ItemFocusFrom } from '../reducers/planner/itemFocus';


export const isIdenticalItem = (item1, item2) => (
  item1 != null
  && item2 != null
  && item1.type === item2.type
  && item1.id === item2.id
);

export const isTableFocusedItem = (item, itemFocus) => (
  (
    itemFocus.from === ItemFocusFrom.TABLE_TAKEN
    || itemFocus.from === ItemFocusFrom.TABLE_FUTURE
    || itemFocus.from === ItemFocusFrom.TABLE_ARBITRARY
  )
  && isIdenticalItem(item, itemFocus.item)
);

export const isTableClickedItem = (item, itemFocus) => (
  isTableFocusedItem(item, itemFocus)
  && itemFocus.clicked === true
);

export const isFocusedItem = (item, itemFocus) => (
  isTableFocusedItem(item, itemFocus)
  || (
    itemFocus.from === ItemFocusFrom.LIST
    && item.course
    && itemFocus.course
    && item.course.id === itemFocus.course.id
  )
);

export const isDimmedItem = (item, itemFocus) => (
  !isFocusedItem(item, itemFocus)
  && itemFocus.clicked === true
);

export const isFocusedListCourse = (course, itemFocus) => (
  itemFocus.from === ItemFocusFrom.LIST
  && itemFocus.course.id === course.id
);

export const isClickedListCourse = (course, itemFocus) => (
  itemFocus.from === ItemFocusFrom.LIST
  && itemFocus.course.id === course.id
  && itemFocus.clicked === true
);

export const isDimmedListCourse = (course, itemFocus) => (
  itemFocus.from === ItemFocusFrom.LIST
  && itemFocus.clicked === true
  && itemFocus.course.id !== course.id
);

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
    return 3; // TODO: Update this
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
    return 0;
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
      return [4, 0, 1];
  }
  return [4, 0, 1];
};

export const getCategoryOfItem = (planner, item) => {
  const type = (
    item.item_type === 'TAKEN'
      ? item.lecture.type_en
      : item.item_type === 'FUTURE'
        ? item.course.type_en
        : 'Other' // TODO: Update this
  );
  const department = (
    item.item_type === 'TAKEN'
      ? item.lecture.department
      : item.item_type === 'FUTURE'
        ? item.course.department
        : 'Other' // TODO: Update this
  );

  return getCategoryOfType(planner, type, department);
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

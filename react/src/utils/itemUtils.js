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
    || itemFocus.from === ItemFocusFrom.TABLE_GENERIC
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
    item.course
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

export const getDefaultCredit = (item) => {
  if (item.type === 'TAKEN') {
    return item.lecture.credit;
  }
  if (item.type === 'FUTURE') {
    return item.course.credit;
  }
  if (item.type === 'GENERIC') {
    return 3; // TODO: Update this
  }
  return 0;
};

export const getCredit = (item) => {
  return getDefaultCredit(item); // TODO: Implement additional customization
};

export const getAu = (item) => {
  if (item.type === 'TAKEN') {
    return item.lecture.credit_au;
  }
  if (item.type === 'FUTURE') {
    return item.course.credit_au;
  }
  if (item.type === 'GENERIC') {
    return 0;
  }
  return 0;
};

export const getCreditAndAu = (item) => {
  return getCredit(item) + getAu(item);
};

export const getCategoryOfType = (planner, type, department) => {
  switch (type) {
    case 'Basic Required':
      return [0, 0, 0];
    case 'Basic Elective':
      return [0, 0, 1];
    case 'Major Required':
      // TODO: Retrieve and check majors and minors from planner
      if (planner?.major_track?.department?.id === department.id) {
        return [1, 0, 0];
      }
      return [1, 1, 0];
    case 'Major Elective':
      // TODO: Retrieve and check majors and minors from planner
      if (planner?.major_track?.department?.id === department.id) {
        return [1, 0, 1];
      }
      return [1, 1, 1];
    case 'Thesis Study(Undergraduate)':
      return [2, 0, 0];
    case 'Individual Study':
      return [2, 0, 1];
    case 'General Required':
      return [3, 0, 0];
    case 'Mandatory General Courses':
      return [3, 0, 0];
    case 'Humanities & Social Elective':
      return [3, 0, 1];
    case 'Other Elective':
      return [4, 0, 0];
    default:
      return [4, 0, 1];
  }
};

export const getCategory = (planner, item) => {
  const type = (
    item.type === 'TAKEN'
      ? item.lecture.type_en
      : item.type === 'FUTURE'
        ? item.course.type_en
        : 'Other' // TODO: Update this
  );
  const department = (
    item.type === 'TAKEN'
      ? item.lecture.department
      : item.type === 'FUTURE'
        ? item.course.department
        : 'Other' // TODO: Update this
  );

  return getCategoryOfType(planner, type, department);
};

export const getColorOfCategory = (planner, category) => {
  if (category[0] === 4) {
    return 17;
  }
  const numAdditionalMajors = planner?.additional_tracks ? planner.additional_tracks.length : 0;
  if (category[0] > 1) {
    return (((category[0] + numAdditionalMajors) * 3) % 16) + 1;
  }
  return (((category[0] + category[1]) * 3) % 16) + 1;
};

export const getColor = (planner, item) => {
  return getColorOfCategory(planner, getCategory(planner, item));
};

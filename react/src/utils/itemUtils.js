import { ItemFocusFrom } from '../reducers/planner/itemFocus';


export const isIdenticalItem = (item1, item2) => (
  item1 != null
  && item2 != null
  && item1.type === item2.type
  && item1.id === item2.id
);

export const isFocused = (item, itemFocus) => (
  isIdenticalItem(item, itemFocus.item)
);

export const isListFocused = (item, itemFocus) => (
  isFocused(item, itemFocus)
  && itemFocus.from === ItemFocusFrom.LIST
);

export const isListClicked = (item, itemFocus) => (
  isListFocused(item, itemFocus)
  && itemFocus.clicked === true
);

export const isTableFocused = (item, itemFocus) => (
  isFocused(item, itemFocus)
  && (
    itemFocus.from === ItemFocusFrom.TABLE_TAKEN
    || itemFocus.from === ItemFocusFrom.TABLE_FUTURE
    || itemFocus.from === ItemFocusFrom.TABLE_GENERIC
  )
);

export const isTableClicked = (item, itemFocus) => (
  isTableFocused(item, itemFocus)
  && itemFocus.clicked === true
);

export const isDimmedTableItem = (item, itemFocus) => (
  !isFocused(item, itemFocus)
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

export const getCreditAndAu = (item) => {
  if (item.type === 'TAKEN') {
    return getDefaultCredit(item) + item.lecture.credit_au;
  }
  if (item.type === 'FUTURE') {
    return getDefaultCredit(item) + item.course.credit_au;
  }
  if (item.type === 'GENERIC') {
    return 3; // TODO: Update this
  }
  return 0;
};

export const getCategory = (planner, item) => {
  const type = (
    item.type === 'TAKEN'
      ? item.lecture.type_en
      : item.type === 'FUTURE'
        ? item.course.type_en
        : 'Other' // TODO: Update this
  );

  switch (type) {
    case 'Basic Required':
      return [0, 0, 0];
    case 'Basic Elective':
      return [0, 0, 1];
    case 'Major Required':
      // TODO: Retrieve and check majors and minors from planner
      return [1, 0, 0];
    case 'Major Elective':
      // TODO: Retrieve and check majors and minors from planner
      return [1, 0, 1];
    case 'Thesis Study(Undergraduate)':
      // TODO: Retrieve and check majors and minors from planner
      return [2, 0, 0];
    case 'Individual Study':
      // TODO: Retrieve and check majors and minors from planner
      return [2, 0, 1];
    case 'General Required':
      return [3, 0, 0];
    case 'Humanities & Social Elective':
      return [3, 0, 1];
    case 'Other Elective':
      return [4, 0, 0];
    default:
      return [4, 0, 1];
  }
};

export const getColorOfCategory = (category) => {
  if (category[0] === 4) {
    return 17;
  }
  return ((category[0] * 3) % 16) + 1;
};

export const getColor = (planner, item) => {
  return getColorOfCategory(getCategory(planner, item));
};

import { ItemFocusFrom } from '../reducers/planner/itemFocus';


export const isIdenticalItem = (item1, item2) => {
  if (!item1 || !item2) {
    return false;
  }
  if (item1.type !== item2.type) {
    return false;
  }
  switch (item1.type) {
    case 'TAKEN':
      return item1.lecture.id === item2.lecture.id;
    case 'FUTURE':
      return item1.course.id === item2.course.id
        && item1.year === item2.year
        && item1.semester === item2.semester;
    case 'GENERIC':
      // TODO: Update below
      return item1.year === item2.year
      && item1.semester === item2.semester;
    default:
      return false;
  }
};

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

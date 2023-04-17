import { ItemFocusFrom } from '../reducers/planner/itemFocus';
import { CategoryFirstIndex, getCategoryOfItem, isIdenticalCategory } from './itemCategoryUtils';
import { getCourseOfItem, getCreditOfItem, getAuOfItem } from './itemUtils';


export const isIdenticalItem = (item1, item2) => (
  item1 != null
  && item2 != null
  && item1.item_type === item2.item_type
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

export const isSingleFocusedItem = (item, itemFocus) => (
  isTableFocusedItem(item, itemFocus)
  || (
    itemFocus.from === ItemFocusFrom.LIST
    && getCourseOfItem(item)
    && itemFocus.course
    && getCourseOfItem(item).id === itemFocus.course.id
  )
);

export const isMultipleFocusedItem = (item, itemFocus, planner) => (
  itemFocus.from === ItemFocusFrom.CATEGORY
  && planner
  && (
    itemFocus.category[0] !== CategoryFirstIndex.TOTAL
      ? isIdenticalCategory(getCategoryOfItem(planner, item), itemFocus.category)
      : itemFocus.category[2] === 0
        ? getCreditOfItem(item) > 0
        : getAuOfItem(item) > 0
  )
);

export const isFocusedItem = (item, itemFocus, planner) => (
  isSingleFocusedItem(item, itemFocus)
  || isMultipleFocusedItem(item, itemFocus, planner)
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

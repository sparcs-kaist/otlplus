import { ItemFocusFrom } from '../reducers/planner/itemFocus';
import { getCourseOfItem } from './itemUtils';


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
    && getCourseOfItem(item)
    && itemFocus.course
    && getCourseOfItem(item).id === itemFocus.course.id
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

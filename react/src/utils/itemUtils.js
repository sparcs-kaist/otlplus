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

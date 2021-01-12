const BASE_STRING = 'T_S_';

/* eslint-disable prefer-template */
export const RESET = BASE_STRING + 'RESET';
export const OPEN_SEARCH = BASE_STRING + 'OPEN_SEARCH';
export const CLOSE_SEARCH = BASE_STRING + 'CLOSE_SEARCH';
export const DRAG_SEARCH = BASE_STRING + 'DRAG_SEARCH';
export const CLEAR_DRAG = BASE_STRING + 'CLEAR_DRAG';
export const SET_LAST_SEARCH_OPTION = BASE_STRING + 'SET_LAST_SEARCH_OPTION';
/* eslint-enable prefer-template */


export function reset() {
  return {
    type: RESET,
  };
}

export function openSearch() {
  return {
    type: OPEN_SEARCH,
  };
}

export function closeSearch() {
  return {
    type: CLOSE_SEARCH,
  };
}

export function setLastSearchOption(lastSearchOption) {
  return {
    type: SET_LAST_SEARCH_OPTION,
    lastSearchOption: lastSearchOption,
  };
}

export function dragSearch(day, start, end) {
  return {
    type: DRAG_SEARCH,
    day: day,
    start: start,
    end: end,
  };
}

export function clearDrag() {
  return {
    type: CLEAR_DRAG,
  };
}

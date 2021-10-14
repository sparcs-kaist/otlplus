const BASE_STRING = 'T_S_';

/* eslint-disable prefer-template */
export const RESET = BASE_STRING + 'RESET';
export const OPEN_SEARCH = BASE_STRING + 'OPEN_SEARCH';
export const CLOSE_SEARCH = BASE_STRING + 'CLOSE_SEARCH';
export const SET_CLASSTIME_OPTIONS = BASE_STRING + 'SET_CLASSTIME_OPTIONS';
export const CLEAR_CLASSTIME_OPTIONS = BASE_STRING + 'CLEAR_CLASSTIME_OPTIONS';
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

export function setClasstimeOptions(classtimeDay, classtimeBegin, classtimeEnd) {
  return {
    type: SET_CLASSTIME_OPTIONS,
    classtimeDay: classtimeDay,
    classtimeBegin: classtimeBegin,
    classtimeEnd: classtimeEnd,
  };
}

export function clearClasstimeOptions() {
  return {
    type: CLEAR_CLASSTIME_OPTIONS,
  };
}

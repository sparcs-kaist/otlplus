export const RESET = 'RESET';
export const OPEN_SEARCH = 'OPEN_SEARCH';
export const CLOSE_SEARCH = 'CLOSE_SEARCH';
export const DRAG_SEARCH = 'DRAG_SEARCH';
export const CLEAR_DRAG = 'CLEAR_DRAG';


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

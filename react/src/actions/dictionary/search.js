export const RESET = 'RESET';
export const OPEN_SEARCH = 'OPEN_SEARCH';
export const CLOSE_SEARCH = 'CLOSE_SEARCH';


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

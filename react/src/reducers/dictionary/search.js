import {
  RESET, OPEN_SEARCH, CLOSE_SEARCH, SET_LAST_SEARCH_OPTION,
} from '../../actions/dictionary/search';

const initialState = {
  open: true,
  lastSearchOption: {},
};

const search = (state = initialState, action) => {
  switch (action.type) {
    case RESET: {
      return initialState;
    }
    case OPEN_SEARCH: {
      return Object.assign({}, state, {
        open: true,
      });
    }
    case CLOSE_SEARCH: {
      return Object.assign({}, state, {
        open: false,
        start: null,
        end: null,
        day: null,
      });
    }
    case SET_LAST_SEARCH_OPTION: {
      return Object.assign({}, state, {
        lastSearchOption: action.lastSearchOption,
      });
    }
    default: {
      return state;
    }
  }
};

export default search;

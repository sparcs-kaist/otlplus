import {
  RESET,
  OPEN_SEARCH, CLOSE_SEARCH,
  SET_LAST_SEARCH_OPTION,
  SET_CLASSTIME_OPTIONS, CLEAR_CLASSTIME_OPTIONS,
} from '../../actions/timetable/search';

const initialState = {
  open: true,
  lastSearchOption: {},
  classtimeBegin: null,
  classtimeEnd: null,
  classtimeDay: null,
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
        classtimeBegin: null,
        classtimeEnd: null,
        classtimeDay: null,
      });
    }
    case SET_LAST_SEARCH_OPTION: {
      return Object.assign({}, state, {
        lastSearchOption: action.lastSearchOption,
      });
    }
    case SET_CLASSTIME_OPTIONS: {
      return Object.assign({}, state, {
        classtimeBegin: action.classtimeBegin,
        classtimeEnd: action.classtimeEnd,
        classtimeDay: action.classtimeDay,
      });
    }
    case CLEAR_CLASSTIME_OPTIONS: {
      return Object.assign({}, state, {
        classtimeBegin: null,
        classtimeEnd: null,
        classtimeDay: null,
      });
    }
    default: {
      return state;
    }
  }
};

export default search;

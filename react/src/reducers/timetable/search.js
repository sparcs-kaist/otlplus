import { RESET, OPEN_SEARCH, CLOSE_SEARCH, DRAG_SEARCH } from '../../actions/timetable/search';

const initialState = {
  open: true,
  start: null,
  end: null,
  day: null,
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
    case DRAG_SEARCH: {
      return Object.assign({}, state, {
        open: true,
        start: action.start,
        end: action.end,
        day: action.day,
      });
    }
    default: {
      return state;
    }
  }
};

export default search;

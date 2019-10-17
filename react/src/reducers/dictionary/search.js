import { OPEN_SEARCH, CLOSE_SEARCH } from '../../actions/dictionary/search';

const initialState = {
  open: true,
};

const search = (state = initialState, action) => {
  switch (action.type) {
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
    default: {
      return state;
    }
  }
};

export default search;

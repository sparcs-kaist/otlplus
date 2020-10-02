import {
  RESET,
  SET_SELECTED_LIST_CODE,
  SET_LIST_COURSES, CLEAR_SEARCH_LIST_COURSES,
  ADD_COURSE_READ,
} from '../../actions/dictionary/list';

export const SEARCH = 'search';
export const BASIC = 'basic';
export const HUMANITY = 'humanity';
export const TAKEN = 'taken';


const initialState = {
  selectedListCode: SEARCH,
  lists: {
    [SEARCH]: {
      courses: [],
    },
    [BASIC]: {
      courses: null,
    },
    [HUMANITY]: {
      courses: null,
    },
    [TAKEN]: {
      courses: null,
    },
  },
  readCourses: [],
};

const list = (state = initialState, action) => {
  switch (action.type) {
    case RESET: {
      return initialState;
    }
    case SET_SELECTED_LIST_CODE: {
      return Object.assign({}, state, {
        selectedListCode: action.listCode,
      });
    }
    case SET_LIST_COURSES: {
      const newState = { ...state };
      newState.lists = { ...newState.lists };
      newState.lists[action.code] = { ...newState.lists[action.code] };
      newState.lists[action.code].courses = action.courses;
      return Object.assign({}, state, newState);
    }
    case CLEAR_SEARCH_LIST_COURSES: {
      const newState = { ...state };
      newState.lists = { ...newState.lists };
      newState.lists[SEARCH] = { ...newState.lists[SEARCH] };
      newState.lists[SEARCH].courses = null;
      return Object.assign({}, state, newState);
    }
    case ADD_COURSE_READ: {
      const newState = {
        readCourses: [
          ...state.readCourses,
          action.course,
        ],
      };
      return Object.assign({}, state, newState);
    }
    default: {
      return state;
    }
  }
};

export default list;

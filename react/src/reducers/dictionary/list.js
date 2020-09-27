import {
  RESET,
  SET_SELECTED_LIST_CODE,
  SET_LIST_MAJOR_CODES,
  SET_LIST_COURSES, SET_LIST_MAJOR_COURSES, CLEAR_LISTS_COURSES, CLEAR_SEARCH_LIST_COURSES,
  ADD_COURSE_READ,
} from '../../actions/dictionary/list';


const initialState = {
  selectedListCode: 'SEARCH',
  search: {
    courses: [],
  },
  basic: {
    lectureGroups: null,
  },
  major: {
    codes: [],
  },
  humanity: {
    courses: null,
  },
  taken: {
    courses: null,
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
    case SET_LIST_MAJOR_CODES: {
      const newState = {
        major: Object.assign(
          {},
          {
            codes: action.majors.map((m) => m.code),
          },
          ...(action.majors.map((m) => (
            {
              [m.code]: {
                name: m.name,
                name_en: m.name_en,
                courses: null,
              },
            }
          ))),
        ),
      };
      return Object.assign({}, state, newState);
    }
    case SET_LIST_COURSES: {
      const newState = {
        [action.code]: {
          ...state[action.code],
          courses: action.courses,
        },
      };
      return Object.assign({}, state, newState);
    }
    case SET_LIST_MAJOR_COURSES: {
      const newState = {
        major: {
          ...state.major,
          [action.majorCode]: {
            ...state.major[action.majorCode],
            courses: action.courses,
          },
        },
      };
      return Object.assign({}, state, newState);
    }
    case CLEAR_LISTS_COURSES: {
      const newState = {
        ...state,
        search: {
          ...state.search,
          courses: [],
        },
        major: Object.assign(
          {},
          state.major,
          ...state.major.codes.map((c) => ({
            [c]: {
              ...state.major[c],
              courses: null,
            },
          })),
        ),
        humanity: {
          ...state.humanity,
          courses: null,
        },
        cart: {
          ...state.cart,
          courses: null,
        },
      };
      return Object.assign({}, state, newState);
    }
    case CLEAR_SEARCH_LIST_COURSES: {
      const newState = {
        search: {
          ...state.search,
          courses: null,
        },
      };
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

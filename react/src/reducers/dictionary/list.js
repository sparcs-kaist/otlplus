import { SET_CURRENT_LIST, SET_LIST_MAJOR_CODES, SET_LIST_COURSES, SET_LIST_MAJOR_COURSES, CLEAR_LISTS_COURSES, CLEAR_SEARCH_LIST_COURSES } from '../../actions/dictionary/list';


const initialState = {
  currentList: 'SEARCH',
  search: {
    courses: [],
  },
  major: {
    codes: ['Basic'],
    Basic: {
      name: '기초 과목',
      courses: null,
    },
  },
  humanity: {
    courses: null,
  },
  taken: {
    courses: null,
  },
};

const list = (state = initialState, action) => {
  switch (action.type) {
    case SET_CURRENT_LIST: {
      return Object.assign({}, state, {
        currentList: action.list,
      });
    }
    case SET_LIST_MAJOR_CODES: {
      const newState = {
        major: Object.assign(
          {},
          {
            codes: action.majors.map(major => major.code),
          },
          ...(action.majors.map(major => (
            {
              [major.code]: {
                name: major.name,
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
          ...state.major.codes.map(c => ({
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
    default: {
      return state;
    }
  }
};

export default list;

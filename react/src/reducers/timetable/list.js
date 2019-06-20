import { SET_CURRENT_LIST, ADD_LECTURE_TO_CART, DELETE_LECTURE_FROM_CART, SET_LIST_MAJOR_CODES, SET_LIST_LECTURES, SET_LIST_MAJOR_LECTURES, CLEAR_LISTS_LECTURES } from '../../actions/timetable/index';


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
  cart: {
    courses: null,
  },
};

const list = (state = initialState, action) => {
  const groupLectures = (lectures) => {
    if (lectures.length === 0) {
      return [];
    }

    const courseIds = Array.from(new Set(lectures.map(lecture => lecture.course)));
    // eslint-disable-next-line fp/no-mutating-methods
    const courses = courseIds
      .map(course => (lectures.filter(lecture => (lecture.course === course))))
      .filter(course => (course.length > 0))
      .sort((a, b) => ((a[0].old_code > b[0].old_code) ? 1 : -1));
    return courses;
  };

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
    case SET_LIST_LECTURES: {
      const newState = {
        [action.code]: {
          ...state[action.code],
          courses: groupLectures(action.lectures),
        },
      };
      return Object.assign({}, state, newState);
    }
    case SET_LIST_MAJOR_LECTURES: {
      const newState = {
        major: {
          ...state.major,
          [action.majorCode]: {
            ...state.major[action.majorCode],
            courses: groupLectures(action.lectures),
          },
        },
      };
      return Object.assign({}, state, newState);
    }
    case CLEAR_LISTS_LECTURES: {
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
    case ADD_LECTURE_TO_CART: {
      const courses = state.cart.courses;
      const i = courses.findIndex(course => (course[0].old_code === action.lecture.old_code));
      const j = (i !== -1)
        ? (courses[i].findIndex(lecture => (lecture.class_no > action.lecture.class_no)) !== -1)
          ? courses[i].findIndex(lecture => (lecture.class_no > action.lecture.class_no))
          : courses[i].length
        : undefined;
      const ii = (i !== -1)
        ? undefined
        : (courses.findIndex(course => (course[0].old_code > action.lecture.old_code)) !== -1)
          ? courses.findIndex(course => (course[0].old_code > action.lecture.old_code))
          : courses.length;
      const newCourses = (i !== -1)
        ? [
          ...courses.slice(0, i),
          [...courses[i].slice(0, j), action.lecture, ...courses[i].slice(j, courses[i].length)],
          ...courses.slice(i + 1, courses.length),
        ]
        : [
          ...courses.slice(0, ii),
          [action.lecture],
          ...courses.slice(ii, courses.length),
        ];
      return Object.assign({}, state, {
        cart: {
          courses: newCourses,
        },
      });
    }
    case DELETE_LECTURE_FROM_CART: {
      const courses = state.cart.courses;
      const i2 = courses.findIndex(course => course.some(lecture => (lecture.id === action.lecture.id)));
      const j = courses[i2].findIndex(lecture => (lecture.id === action.lecture.id));
      const newCourses = [
        ...courses.slice(0, i2),
        ...((courses[i2].length === 1) ? [] : [[...courses[i2].slice(0, j), ...courses[i2].slice(j + 1, courses[i2].length)]]),
        ...courses.slice(i2 + 1, courses.length),
      ];
      return Object.assign({}, state, {
        cart: {
          courses: newCourses,
        },
      });
    }
    default: {
      return state;
    }
  }
};

export default list;

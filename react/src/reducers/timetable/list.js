import { SET_CURRENT_LIST, ADD_LECTURE_TO_CART, DELETE_LECTURE_FROM_CART, SET_LIST_MAJOR_CODES, SET_LIST_LECTURES, SET_LIST_MAJOR_LECTURES } from '../../actions/timetable/index';


const initialState = {
  currentList: 'SEARCH',
  search: {
    courses: [],
  },
  major: {
    codes: ['Basic'],
    Basic: {
      name: '기초 과목',
      courses: [],
    },
  },
  humanity: {
    courses: [],
  },
  cart: {
    courses: [],
  },
};

const list = (state = initialState, action) => {
  const groupLectures = (lectures) => {
    if (lectures.length === 0) {
      return [];
    }

    const courseIds = Array.from(new Set(lectures.map(lecture => lecture.course)));
    const courses = courseIds
      .map(course => (lectures.filter(lecture => (lecture.course === course))))
      .filter(course => (course.length > 0))
      .sort((a, b) => ((a[0].old_code > b[0].old_code) ? 1 : -1));
    return courses;
  };
  const newState = {};

  switch (action.type) {
    case SET_CURRENT_LIST:
      return Object.assign({}, state, {
        currentList: action.list,
      });
    case SET_LIST_MAJOR_CODES:
      newState.major = {
        codes: action.majors.map(major => major.code),
      };
      action.majors.forEach((major) => {
        newState.major[major.code] = {
          name: major.name,
          courses: [],
        };
      });
      return Object.assign({}, state, newState);
    case SET_LIST_LECTURES:
      newState[action.code] = {
        ...state[action.code],
        courses: groupLectures(action.lectures),
      };
      return Object.assign({}, state, newState);
    case SET_LIST_MAJOR_LECTURES:
      newState.major = {
        ...state.major,
      };
      newState.major[action.majorCode] = {
        ...newState.major[action.majorCode],
        courses: groupLectures(action.lectures),
      };
      return Object.assign({}, state, newState);
    case ADD_LECTURE_TO_CART:
      let courses = state.cart.courses;
      const i = courses.findIndex(course => (course[0].old_code === action.lecture.old_code));
      if (i !== -1) {
        const j = courses[i].findIndex(lecture => (lecture.class_no > action.lecture.class_no));
        if (j !== -1) {
          courses[i].splice(j, 0, action.lecture);
        }
        else {
          courses[i].push(action.lecture);
        }
      }
      else {
        const ii = courses.findIndex(course => (course[0].old_code > action.lecture.old_code));
        if (ii !== -1) {
          courses.splice(ii, 0, [action.lecture]);
        }
        else {
          courses.push([action.lecture]);
        }
      }
      return Object.assign({}, state, {
        cart: {
          courses: courses,
        },
      });
    case DELETE_LECTURE_FROM_CART:
      courses = state.cart.courses;
      const i2 = courses.findIndex(course => course.some(lecture => (lecture.id === action.lecture.id)));
      const j = courses[i2].findIndex(lecture => (lecture.id === action.lecture.id));
      courses[i2].splice(j, 1);
      if (courses[i2].length === 0) {
        courses.splice(i2, 1);
      }
      return Object.assign({}, state, {
        cart: {
          courses: courses,
        },
      });
    default:
      return state;
  }
};

export default list;

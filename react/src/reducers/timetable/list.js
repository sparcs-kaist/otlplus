import { SET_CURRENT_LIST, ADD_LECTURE_TO_CART, DELETE_LECTURE_FROM_CART, SET_LIST_LECTURES } from '../../actions/timetable/index';


const initialState = {
  currentList: 'SEARCH',
  search: {
    courses: [],
  },
  major: {
    codes: ['ID', 'CS'],
    ID: {
      name: '신압디자인학과',
      courses: [],
    },
    CS: {
      name: '전산학부',
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
  switch (action.type) {
    case SET_CURRENT_LIST:
      return Object.assign({}, state, {
        currentList: action.list,
      });
    case SET_LIST_LECTURES:
      const groupLectures = (lectures) => {
        if (lectures.length === 0) {
          return [];
        }

        const courses = [[lectures[0]]];
        for (let i = 1, lecture; lectures[i] !== undefined; i++) {
          lecture = lectures[i];
          if (lecture.course === courses[courses.length - 1][0].course) {
            courses[courses.length - 1].push(lecture);
          }
          else {
            courses.push([lecture]);
          }
        }
        return courses;
      };
      const newState = {};
      newState[action.code] = {
        ...state[action.code],
        courses: groupLectures(action.lectures),
      };
      return Object.assign({}, state, newState);
    case ADD_LECTURE_TO_CART:
      let courses = state.cart.courses;
      let breakFlag = false;
      for (let i = 0, course; (course = courses[i]); i++) {
        if (course[0].old_code < action.lecture.old_code) {
          continue;
        }
        else if (course[0].old_code === action.lecture.old_code) {
          let j;
          let lecture;
          for (j = 0; (lecture = course[j]); j++) {
            if (lecture.class_no < action.lecture.class_no) {
              continue;
            }
            else {
              course.splice(j, 0, action.lecture);
              breakFlag = true;
              break;
            }
          }
          if (j === course.length) {
            course.push(action.lecture);
          }
          breakFlag = true;
          break;
        }
        else {
          courses.splice(i, 0, [action.lecture]);
          breakFlag = true;
          break;
        }
      }
      if (!breakFlag) {
        courses.push([action.lecture]);
      }
      return Object.assign({}, state, {
        cart: {
          courses: courses,
        },
      });
    case DELETE_LECTURE_FROM_CART:
      courses = state.cart.courses;
      for (let i = 0, course; (course = courses[i]); i++) {
        for (let j = 0, lecture; (lecture = course[j]); j++) {
          if (lecture.id === action.lecture.id) {
            course.splice(j, 1);
            j -= 1;
          }
        }
        if (course.length === 0) {
          courses.splice(i, 1);
          i -= 1;
        }
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

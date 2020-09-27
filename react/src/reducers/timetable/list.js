import {
  RESET,
  SET_SELECTED_LIST_CODE,
  SET_LIST_LECTURES, SET_LIST_MAJOR_LECTURES, CLEAR_LISTS_LECTURES, CLEAR_SEARCH_LIST_LECTURES,
  ADD_LECTURE_TO_CART, DELETE_LECTURE_FROM_CART,
  SET_MOBILE_IS_LECTURE_LIST_OPEN,
} from '../../actions/timetable/list';

import { unique } from '../../common/utilFunctions';


const initialState = {
  selectedListCode: 'SEARCH',
  search: {
    lectureGroups: [],
  },
  basic: {
    lectureGroups: null,
  },
  major: {
  },
  humanity: {
    lectureGroups: null,
  },
  cart: {
    lectureGroups: null,
  },
  mobileIsLectureListOpen: false,
};

const list = (state = initialState, action) => {
  const groupLectures = (lectures) => {
    if (lectures.length === 0) {
      return [];
    }

    const courseIds = unique(lectures.map((l) => l.course));
    // eslint-disable-next-line fp/no-mutating-methods
    const lectureGroups = courseIds
      .map((c) => (lectures.filter((l) => (l.course === c))))
      .filter((c) => (c.length > 0))
      .sort((a, b) => ((a[0].old_code > b[0].old_code) ? 1 : -1));
    return lectureGroups;
  };

  switch (action.type) {
    case RESET: {
      return initialState;
    }
    case SET_SELECTED_LIST_CODE: {
      return Object.assign({}, state, {
        selectedListCode: action.listCode,
      });
    }
    case SET_LIST_LECTURES: {
      const newState = {
        [action.code]: {
          ...state[action.code],
          lectureGroups: groupLectures(action.lectures),
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
            lectureGroups: groupLectures(action.lectures),
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
          lectureGroups: [],
        },
        major: Object.assign(
          {},
          state.major,
          ...Object.keys(state.major).map((k) => ({
            [k]: {
              ...state.major[k],
              lectureGroups: null,
            },
          })),
        ),
        humanity: {
          ...state.humanity,
          lectureGroups: null,
        },
        cart: {
          ...state.cart,
          lectureGroups: null,
        },
      };
      return Object.assign({}, state, newState);
    }
    case CLEAR_SEARCH_LIST_LECTURES: {
      const newState = {
        search: {
          ...state.search,
          lectureGroups: null,
        },
      };
      return Object.assign({}, state, newState);
    }
    case ADD_LECTURE_TO_CART: {
      const { lectureGroups } = state.cart;
      const i = lectureGroups.findIndex((lg) => (lg[0].old_code === action.lecture.old_code));
      const j = (i !== -1)
        ? (lectureGroups[i].findIndex((l) => (l.class_no > action.lecture.class_no)) !== -1)
          ? lectureGroups[i].findIndex((l) => (l.class_no > action.lecture.class_no))
          : lectureGroups[i].length
        : undefined;
      const ii = (i !== -1)
        ? undefined
        : (lectureGroups.findIndex((lg) => (lg[0].old_code > action.lecture.old_code)) !== -1)
          ? lectureGroups.findIndex((lg) => (lg[0].old_code > action.lecture.old_code))
          : lectureGroups.length;
      const newLectureGroups = (i !== -1)
        ? [
          ...lectureGroups.slice(0, i),
          [...lectureGroups[i].slice(0, j), action.lecture, ...lectureGroups[i].slice(j, lectureGroups[i].length)],
          ...lectureGroups.slice(i + 1, lectureGroups.length),
        ]
        : [
          ...lectureGroups.slice(0, ii),
          [action.lecture],
          ...lectureGroups.slice(ii, lectureGroups.length),
        ];
      return Object.assign({}, state, {
        cart: {
          lectureGroups: newLectureGroups,
        },
      });
    }
    case DELETE_LECTURE_FROM_CART: {
      const { lectureGroups } = state.cart;
      const i2 = lectureGroups.findIndex((lg) => lg.some((lecture) => (lecture.id === action.lecture.id)));
      const j = lectureGroups[i2].findIndex((lecture) => (lecture.id === action.lecture.id));
      const newLectureGroups = [
        ...lectureGroups.slice(0, i2),
        ...((lectureGroups[i2].length === 1) ? [] : [[...lectureGroups[i2].slice(0, j), ...lectureGroups[i2].slice(j + 1, lectureGroups[i2].length)]]),
        ...lectureGroups.slice(i2 + 1, lectureGroups.length),
      ];
      return Object.assign({}, state, {
        cart: {
          lectureGroups: newLectureGroups,
        },
      });
    }
    case SET_MOBILE_IS_LECTURE_LIST_OPEN: {
      return Object.assign({}, state, {
        mobileIsLectureListOpen: action.mobileIsLectureListOpen,
      });
    }
    default: {
      return state;
    }
  }
};

export default list;

import {
  RESET,
  SET_SELECTED_LIST_CODE,
  SET_LIST_LECTURES, CLEAR_ALL_LISTS_LECTURES, CLEAR_SEARCH_LIST_LECTURES,
  ADD_LECTURE_TO_CART, DELETE_LECTURE_FROM_CART,
  SET_MOBILE_IS_LECTURE_LIST_OPEN,
} from '../../actions/timetable/list';

import { unique } from '../../utils/commonUtils';

export const LectureListCode = {
  SEARCH: 'search',
  BASIC: 'basic',
  HUMANITY: 'humanity',
  CART: 'cart',
};


const initialState = {
  selectedListCode: LectureListCode.SEARCH,
  lists: {
    [LectureListCode.SEARCH]: {
      lectureGroups: [],
    },
    [LectureListCode.BASIC]: {
      lectureGroups: null,
    },
    [LectureListCode.HUMANITY]: {
      lectureGroups: null,
    },
    [LectureListCode.CART]: {
      lectureGroups: null,
    },
  },
  mobileIsLectureListOpen: false,
};

const list = (state = initialState, action) => {
  const groupLectures = (lectures) => {
    if (lectures.length === 0) {
      return [];
    }

    // eslint-disable-next-line fp/no-mutating-methods
    const sortedLectures = lectures.sort((a, b) => {
      if (a.old_code !== b.old_code) {
        return (a.old_code > b.old_code) ? 10 : -10;
      }
      return (a.class_no > b.class_no) ? 1 : -1;
    });
    const courseIds = unique(sortedLectures.map((l) => l.course));
    const lectureGroups = courseIds
      .map((c) => (sortedLectures.filter((l) => (l.course === c))))
      .filter((c) => (c.length > 0));
    return lectureGroups;
  };

  const ungroupLectureGroups = (lectureGroups) => (
    lectureGroups.flat(1)
  );


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
      /* eslint-disable fp/no-mutation */
      const newState = { ...state };
      newState.lists = { ...newState.lists };
      newState.lists[action.code] = { ...newState.lists[action.code] };
      newState.lists[action.code].lectureGroups = groupLectures(action.lectures);
      /* eslint-enable fp/no-mutation */
      return Object.assign({}, state, newState);
    }
    case CLEAR_ALL_LISTS_LECTURES: {
      /* eslint-disable fp/no-mutation */
      const newState = { ...state };
      newState.lists = { ...newState.lists };
      Object.keys(newState.lists).forEach((k) => {
        newState.lists[k] = { ...newState.lists[k] };
        if (k === LectureListCode.SEARCH) {
          newState.lists[k].lectureGroups = [];
        }
        else {
          newState.lists[k].lectureGroups = null;
        }
      });
      /* eslint-enable fp/no-mutation */
      return Object.assign({}, state, newState);
    }
    case CLEAR_SEARCH_LIST_LECTURES: {
      /* eslint-disable fp/no-mutation */
      const newState = { ...state };
      newState.lists = { ...newState.lists };
      newState.lists[LectureListCode.SEARCH] = { ...newState.lists[LectureListCode.SEARCH] };
      newState.lists[LectureListCode.SEARCH].lectureGroups = null;
      /* eslint-enable fp/no-mutation */
      return Object.assign({}, state, newState);
    }
    case ADD_LECTURE_TO_CART: {
      const { lectureGroups } = state.lists[LectureListCode.CART];
      const lectures = ungroupLectureGroups(lectureGroups);
      const newLectures = [...lectures, action.lecture];
      const newLectureGroups = groupLectures(newLectures);
      /* eslint-disable fp/no-mutation */
      const newState = { ...state };
      newState.lists = { ...newState.lists };
      newState.lists[LectureListCode.CART] = { ...newState.lists[LectureListCode.CART] };
      newState.lists[LectureListCode.CART].lectureGroups = newLectureGroups;
      /* eslint-enable fp/no-mutation */
      return Object.assign({}, state, newState);
    }
    case DELETE_LECTURE_FROM_CART: {
      const { lectureGroups } = state.lists[LectureListCode.CART];
      const lectures = ungroupLectureGroups(lectureGroups);
      const newLectures = lectures.filter((l) => (l.id !== action.lecture.id));
      const newLectureGroups = groupLectures(newLectures);
      /* eslint-disable fp/no-mutation */
      const newState = { ...state };
      newState.lists = { ...newState.lists };
      newState.lists[LectureListCode.CART] = { ...newState.lists[LectureListCode.CART] };
      newState.lists[LectureListCode.CART].lectureGroups = newLectureGroups;
      /* eslint-enable fp/no-mutation */
      return Object.assign({}, state, newState);
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

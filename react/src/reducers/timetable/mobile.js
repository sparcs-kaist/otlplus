import { TOGGLE_LECTURE_LIST, MODAL_TIMETABLE_LIST, LECTURE_INFO } from '../../actions/timetable/index';


const initialState = {
  showLectureListFlag: false,
  showTimetableListFlag: false,
  showLectureInfoFlag: false,
};

const mobile = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_LECTURE_LIST:
      return {
        ...state,
        showLectureListFlag: !state.showLectureListFlag,
      };
    case MODAL_TIMETABLE_LIST:
      return {
        ...state,
        showTimetableListFlag: !state.showTimetableListFlag,
      };
    case LECTURE_INFO:
      return {
        ...state,
        showLectureInfoFlag: !state.showLectureInfoFlag,
      };
    default: return state;
  }
};

export default mobile;

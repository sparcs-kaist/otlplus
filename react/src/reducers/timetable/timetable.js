import { SET_TIMETABLES, CLEAR_TIMETABLES, SET_CURRENT_TIMETABLE, CREATE_TIMETABLE, DELETE_TIMETABLE, DUPLICATE_TIMETABLE, ADD_LECTURE_TO_TIMETABLE, REMOVE_LECTURE_FROM_TIMETABLE, UPDATE_CELL_SIZE, SET_IS_DRAGGING, SET_MOBILE_SHOW_TIMETABLE_TABS } from '../../actions/timetable/index';

const initialState = {
  timetables: null,
  currentTimetable: null,
  cellWidth: 200,
  cellHeight: 50,
  isDragging: false,
  mobileShowTimetableTabs: false,
};

const timetable = (state = initialState, action) => {
  switch (action.type) {
    case SET_TIMETABLES: {
      return Object.assign({}, state, {
        timetables: action.timetables,
        currentTimetable: action.timetables[0],
      });
    }
    case CLEAR_TIMETABLES: {
      return Object.assign({}, state, {
        timetables: null,
        currentTimetable: null,
      });
    }
    case SET_CURRENT_TIMETABLE: {
      return Object.assign({}, state, {
        currentTimetable: action.timetable,
      });
    }
    case CREATE_TIMETABLE: {
      const newTable = {
        id: action.id,
        lectures: [],
      };
      return Object.assign({}, state, {
        currentTimetable: newTable,
        timetables: [
          ...state.timetables,
          newTable,
        ],
      });
    }
    case DELETE_TIMETABLE: {
      const newTables = state.timetables.filter(t => (t.id !== action.timetable.id));
      return Object.assign({}, state, {
        currentTimetable: newTables[0],
        timetables: newTables,
      });
    }
    case DUPLICATE_TIMETABLE: {
      const newTable = {
        id: action.id,
        lectures: action.timetable.lectures.slice(),
      };
      return Object.assign({}, state, {
        currentTimetable: newTable,
        timetables: [
          ...state.timetables,
          newTable,
        ],
      });
    }
    case ADD_LECTURE_TO_TIMETABLE: {
      const newTable = {
        id: state.currentTimetable.id,
        lectures: state.currentTimetable.lectures.concat([action.lecture]),
      };
      const newTables = state.timetables.map(t => (
        t.id === newTable.id
          ? newTable
          : t
      ));
      return Object.assign({}, state, {
        currentTimetable: newTable,
        timetables: newTables,
      });
    }
    case REMOVE_LECTURE_FROM_TIMETABLE: {
      const newTable = {
        id: state.currentTimetable.id,
        lectures: state.currentTimetable.lectures.slice().filter(lecture => (lecture.id !== action.lecture.id)),
      };
      const newTables = state.timetables.map(t => (
        t.id === newTable.id
          ? newTable
          : t
      ));
      return Object.assign({}, state, {
        currentTimetable: newTable,
        timetables: newTables,
      });
    }
    case UPDATE_CELL_SIZE: {
      return Object.assign({}, state, {
        cellWidth: action.width,
        cellHeight: action.height,
      });
    }
    case SET_IS_DRAGGING: {
      return Object.assign({}, state, {
        isDragging: action.isDragging,
      });
    }
    case SET_MOBILE_SHOW_TIMETABLE_TABS: {
      return Object.assign({}, state, {
        mobileShowTimetableTabs: action.mobileShowTimetableTabs,
      });
    }
    default: {
      return state;
    }
  }
};

export default timetable;

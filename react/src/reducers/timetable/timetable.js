import {
  RESET,
  SET_TIMETABLES, CLEAR_TIMETABLES,
  SET_MY_TIMETABLE_LECTURES,
  SET_SELECTED_TIMETABLE,
  CREATE_TIMETABLE, DELETE_TIMETABLE, DUPLICATE_TIMETABLE,
  ADD_LECTURE_TO_TIMETABLE, REMOVE_LECTURE_FROM_TIMETABLE,
  UPDATE_CELL_SIZE,
  SET_IS_DRAGGING,
  SET_MOBILE_IS_TIMETABLE_TABS_OPEN,
} from '../../actions/timetable/timetable';

const MY = -1;

const initialState = {
  timetables: null,
  myTimetable: {
    id: MY,
    lectures: [],
    isReadOnly: true,
  },
  selectedTimetable: null,
  cellWidth: 200,
  cellHeight: 50,
  isDragging: false,
  mobileIsTimetableTabsOpen: false,
};

const timetable = (state = initialState, action) => {
  switch (action.type) {
    case RESET: {
      return initialState;
    }
    case SET_TIMETABLES: {
      return Object.assign({}, state, {
        timetables: action.timetables,
        selectedTimetable: (
          state.selectedTimetable && (state.selectedTimetable.id === state.myTimetable.id)
            ? state.selectedTimetable
            : action.timetables[0]
        ),
      });
    }
    case CLEAR_TIMETABLES: {
      return Object.assign({}, state, {
        timetables: null,
        selectedTimetable: (
          state.selectedTimetable && (state.selectedTimetable.id === state.myTimetable.id)
            ? {
              ...state.selectedTimetable,
              lectures: [],
            }
            : null
        ),
      });
    }
    case SET_MY_TIMETABLE_LECTURES: {
      return Object.assign({}, state, {
        myTimetable: {
          ...state.myTimetable,
          lectures: action.lectures,
        },
        selectedTimetable: (
          state.selectedTimetable && (state.selectedTimetable.id === state.myTimetable.id)
            ? {
              ...state.selectedTimetable,
              lectures: action.lectures,
            }
            : state.selectedTimetable
        ),
      });
    }
    case SET_SELECTED_TIMETABLE: {
      return Object.assign({}, state, {
        selectedTimetable: action.timetable,
      });
    }
    case CREATE_TIMETABLE: {
      const newTable = {
        id: action.id,
        lectures: [],
      };
      return Object.assign({}, state, {
        selectedTimetable: newTable,
        timetables: [
          ...state.timetables,
          newTable,
        ],
      });
    }
    case DELETE_TIMETABLE: {
      const newTables = state.timetables.filter((t) => (t.id !== action.timetable.id));
      return Object.assign({}, state, {
        selectedTimetable: newTables[0],
        timetables: newTables,
      });
    }
    case DUPLICATE_TIMETABLE: {
      const newTable = {
        id: action.id,
        lectures: action.timetable.lectures.slice(),
      };
      return Object.assign({}, state, {
        selectedTimetable: newTable,
        timetables: [
          ...state.timetables,
          newTable,
        ],
      });
    }
    case ADD_LECTURE_TO_TIMETABLE: {
      const newTable = {
        id: state.selectedTimetable.id,
        lectures: state.selectedTimetable.lectures.concat([action.lecture]),
      };
      const newTables = state.timetables.map((t) => (
        t.id === newTable.id
          ? newTable
          : t
      ));
      return Object.assign({}, state, {
        selectedTimetable: newTable,
        timetables: newTables,
      });
    }
    case REMOVE_LECTURE_FROM_TIMETABLE: {
      const newTable = {
        id: state.selectedTimetable.id,
        lectures: state.selectedTimetable.lectures.slice().filter((l) => (l.id !== action.lecture.id)),
      };
      const newTables = state.timetables.map((t) => (
        t.id === newTable.id
          ? newTable
          : t
      ));
      return Object.assign({}, state, {
        selectedTimetable: newTable,
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
    case SET_MOBILE_IS_TIMETABLE_TABS_OPEN: {
      return Object.assign({}, state, {
        mobileIsTimetableTabsOpen: action.mobileIsTimetableTabsOpen,
      });
    }
    default: {
      return state;
    }
  }
};

export default timetable;

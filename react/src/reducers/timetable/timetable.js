import { SET_TIMETABLES, SET_CURRENT_TIMETABLE, CREATE_TIMETABLE, DELETE_TIMETABLE, DUPLICATE_TIMETABLE, ADD_LECTURE_TO_TIMETABLE, REMOVE_LECTURE_FROM_TIMETABLE, UPDATE_CELL_SIZE, SET_IS_DRAGGING } from '../../actions/timetable/index';

const initialState = {
  timetables: [],
  currentTimetable: {
    id: -1,
    lectures: [],
  },
  cellWidth: 200,
  cellHeight: 50,
  isDragging: false,
};

const timetable = (state = initialState, action) => {
  switch (action.type) {
    case SET_TIMETABLES:
      return Object.assign({}, state, {
        timetables: action.timetables,
        currentTimetable: action.timetables[0],
      });
    case SET_CURRENT_TIMETABLE:
      return Object.assign({}, state, {
        currentTimetable: action.timetable,
      });
    case CREATE_TIMETABLE:
      let newTable = {
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
    case DELETE_TIMETABLE:
      let newTables = state.timetables.filter(t => (t.id !== action.timetable.id));
      return Object.assign({}, state, {
        currentTimetable: newTables[0],
        timetables: newTables,
      });
    case DUPLICATE_TIMETABLE:
      newTable = {
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
    case ADD_LECTURE_TO_TIMETABLE:
      newTable = {
        id: state.currentTimetable.id,
        lectures: state.currentTimetable.lectures.concat([action.lecture]),
      };
      newTables = state.timetables.map(t => (
        t.id === newTable.id
          ? newTable
          : t
      ));
      for (let i = 0; i < newTables.length; i++) {
        if (newTables[i].id === state.currentTimetable.id) {
          newTables[i] = newTable;
        }
      }
      return Object.assign({}, state, {
        currentTimetable: newTable,
        timetables: newTables,
      });
    case REMOVE_LECTURE_FROM_TIMETABLE:
      newTable = {
        id: state.currentTimetable.id,
        lectures: state.currentTimetable.lectures.slice().filter(lecture => (lecture.id !== action.lecture.id)),
      };
      newTables = state.timetables.map(t => (
        t.id === newTable.id
          ? newTable
          : t
      ));
      return Object.assign({}, state, {
        currentTimetable: newTable,
        timetables: newTables,
      });
    case UPDATE_CELL_SIZE:
      return Object.assign({}, state, {
        cellWidth: action.width,
        cellHeight: action.height,
      });
    case SET_IS_DRAGGING:
      return Object.assign({}, state, {
        isDragging: action.isDragging,
      });
    default:
      return state;
  }
};

export default timetable;

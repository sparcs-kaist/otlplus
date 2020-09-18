import { combineReducers } from 'redux';
import semester from './semester';
import search from './search';
import list from './list';
import timetable from './timetable';
import lectureFocus from './lectureFocus';

const CombinedReducer = combineReducers({
  semester: semester,
  search: search,
  list: list,
  timetable: timetable,
  lectureFocus: lectureFocus,
});

export default CombinedReducer;

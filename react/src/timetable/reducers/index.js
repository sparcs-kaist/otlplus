import { combineReducers } from 'redux';
import { semester } from './semester';
import { search } from './search';
import { list } from './list';
import { timetable } from './timetable';
import { lectureActive } from './lectureActive';
import { mobile } from './mobile';

const CombinedReducer = combineReducers({
  semester: semester,
  search: search,
  list: list,
  timetable: timetable,
  lectureActive: lectureActive,
  mobile: mobile,
});

export default CombinedReducer;

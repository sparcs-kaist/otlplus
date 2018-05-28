import { semester } from './semester';
import { combineReducers } from 'redux';
import { search } from './search';
import { list } from './list';
import { timetable } from './timetable';
import { lectureActive } from './lectureActive';

const CombinedReducer = combineReducers({
    semester : semester,
    search : search,
    list : list,
    timetable : timetable,
    lectureActive : lectureActive,
});

export default CombinedReducer;
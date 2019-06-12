import { SET_SEMESTER } from '../../actions/timetable/index';

const initialState = {
  year: 2018,
  semester: 1,
};

const semester = (state = initialState, action) => {
  switch (action.type) {
    case SET_SEMESTER:
      return Object.assign({}, state, {
        year: action.year,
        semester: action.semester,
      });
    default:
      return state;
  }
};

export default semester;

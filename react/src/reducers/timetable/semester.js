import { SET_SEMESTER } from '../../actions/timetable/index';

const initialState = {
  year: null,
  semester: null,
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

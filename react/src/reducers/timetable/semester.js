import { RESET, SET_SEMESTER } from '../../actions/timetable/semester';

const initialState = {
  year: null,
  semester: null,
};

const semester = (state = initialState, action) => {
  switch (action.type) {
    case RESET: {
      return initialState;
    }
    case SET_SEMESTER: {
      return Object.assign({}, state, {
        year: action.year,
        semester: action.semester,
      });
    }
    default: {
      return state;
    }
  }
};

export default semester;

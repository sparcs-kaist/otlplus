import { SET_SEMESTERS } from '../../actions/common/semester';

const initialState = {
  semesters: null,
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_SEMESTERS:
      return Object.assign({}, state, {
        semesters: action.semesters,
      });
    default:
      return state;
  }
};

export default reducer;

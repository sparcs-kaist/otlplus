import { SET_TRACKS } from '../../actions/common/track';

const initialState = {
  tracks: null,
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_TRACKS:
      return Object.assign({}, state, {
        tracks: action.tracks,
      });
    default:
      return state;
  }
};

export default reducer;

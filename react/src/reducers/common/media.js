import { SET_IS_PORTRAIT } from '../../actions/common/media';

const initialState = {
  isPortrait: false,
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_IS_PORTRAIT:
      return Object.assign({}, state, {
        isPortrait: action.isPortrait,
      });
    default:
      return state;
  }
};

export default reducer;

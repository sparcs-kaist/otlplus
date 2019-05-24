import { SET_USER } from "../actions/user";

const initialState = {
    user: null,
};

export const reducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_USER:
            return Object.assign({}, state, {
                user : action.user,
            });
        default:
            return state;
    }
};

export default reducer;
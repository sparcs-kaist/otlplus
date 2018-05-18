import { OPEN_SEARCH, CLOSE_SEARCH } from '../actions/index';

const initialState = {
    open : true,
};

export const search = (state = initialState, action) => {
    switch (action.type) {
        case OPEN_SEARCH:
            return Object.assign({}, state, {
                open : true,
            });
        case CLOSE_SEARCH:
            return Object.assign({}, state, {
                open : false,
            });
        default:
            return state;
    }
};

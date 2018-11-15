import { OPEN_SEARCH, CLOSE_SEARCH, DRAG_SEARCH } from '../actions/index';

const initialState = {
    open : true,
    start : 0,
    end : 0,
    day : 0,
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
        case DRAG_SEARCH:
            return Object.assign({},state, {
                open : true,
                start : action.start,
                end : action.end,
                day : action.day,
            });
        default:
            return state;
    }
};

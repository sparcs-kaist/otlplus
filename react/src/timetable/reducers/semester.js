import { SET_SEMESTER } from '../actions/index';

const initialState = {
    year : null,
    semester : null,
};

export const semester = (state = initialState, action) => {
    switch (action.type) {
        case SET_SEMESTER:
            return Object.assign({}, state, {
                year : action.year,
                semester : action.semester,
            });
        default:
            return state;
    }
};
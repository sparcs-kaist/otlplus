import {
  RESET,
  SET_ITEM_FOCUS, CLEAR_ITEM_FOCUS,
  SET_REVIEWS, SET_LECTURES,
} from '../../actions/planner/itemFocus';


export const ItemFocusFrom = {
  NONE: 'NONE',
  LIST: 'LIST',
  TABLE_TAKEN: 'TABLE_TAKEN',
  FUTURE_TAKEN: 'FUTURE_TAKEN',
  GENERIC_TAKEN: 'GENERIC_TAKEN',
};


const initialState = {
  from: ItemFocusFrom.NONE,
  course: null,
  reviews: null,
  lectures: null,
};

const itemFocus = (state = initialState, action) => {
  switch (action.type) {
    case RESET: {
      return initialState;
    }
    case SET_ITEM_FOCUS: {
      const courseChanged = !state.course || (state.course.id !== action.course.id);
      return Object.assign({}, state, {
        from: action.from,
        course: action.course,
      },
      (courseChanged
        ? { reviews: null, lectures: null }
        : {}
      ));
    }
    case CLEAR_ITEM_FOCUS: {
      return Object.assign({}, state, {
        from: ItemFocusFrom.NONE,
        course: null,
        reviews: null,
        lectures: null,
      });
    }
    case SET_REVIEWS: {
      return Object.assign({}, state, {
        reviews: action.reviews,
      });
    }
    case SET_LECTURES: {
      return Object.assign({}, state, {
        lectures: action.lectures,
      });
    }
    default: {
      return state;
    }
  }
};

export default itemFocus;

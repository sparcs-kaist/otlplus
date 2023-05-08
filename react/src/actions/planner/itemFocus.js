const BASE_STRING = 'I_CA_';

/* eslint-disable prefer-template */
export const RESET = BASE_STRING + 'RESET';
export const SET_ITEM_FOCUS = BASE_STRING + 'SET_ITEM_FOCUS';
export const CLEAR_ITEM_FOCUS = BASE_STRING + 'CLEAR_ITEM_FOCUS';
export const SET_CATEGORY_FOCUS = BASE_STRING + 'SET_CATEGORY_FOCUS';
export const CLEAR_CATEGORY_FOCUS = BASE_STRING + 'CLEAR_CATEGORY_FOCUS';
export const SET_REVIEWS = BASE_STRING + 'SET_REVIEWS';
export const SET_LECTURES = BASE_STRING + 'SET_LECTURES';
/* eslint-enable prefer-template */


export function reset() {
  return {
    type: RESET,
  };
}

export function setItemFocus(item, course, from, clicked) {
  return {
    type: SET_ITEM_FOCUS,
    item: item,
    course: course,
    from: from,
    clicked: clicked,
  };
}

export function clearItemFocus() {
  return {
    type: CLEAR_ITEM_FOCUS,
  };
}

export function setCategoryFocus(category) {
  return {
    type: SET_CATEGORY_FOCUS,
    category: category,
  };
}

export function clearCategoryFocus() {
  return {
    type: CLEAR_CATEGORY_FOCUS,
  };
}

export function setReviews(reviews) {
  return {
    type: SET_REVIEWS,
    reviews: reviews,
  };
}

export function setLectures(lectures) {
  return {
    type: SET_LECTURES,
    lectures: lectures,
  };
}

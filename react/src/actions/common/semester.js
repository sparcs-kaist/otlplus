const BASE_STRING = 'C_S_';

/* eslint-disable prefer-template */
export const SET_SEMESTERS = BASE_STRING + 'SET_SEMESTERS';
/* eslint-enable prefer-template */

export function setSemesters(semesters) {
  return {
    type: SET_SEMESTERS,
    semesters: semesters,
  };
}

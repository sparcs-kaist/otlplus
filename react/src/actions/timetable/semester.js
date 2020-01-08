const BASE_STRING = 'T_SM_';

/* eslint-disable prefer-template */
export const RESET = BASE_STRING + 'RESET';
export const SET_SEMESTER = BASE_STRING + 'SET_SEMESTER';
/* eslint-enable prefer-template */


export function reset() {
  return {
    type: RESET,
  };
}

export function setSemester(year, semester) {
  return {
    type: SET_SEMESTER,
    year: year,
    semester: semester,
  };
}

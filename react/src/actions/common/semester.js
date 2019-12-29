export const SET_SEMESTERS = 'SET_SEMESTERS';

export function setSemesters(semesters) {
  return {
    type: SET_SEMESTERS,
    semesters: semesters,
  };
}

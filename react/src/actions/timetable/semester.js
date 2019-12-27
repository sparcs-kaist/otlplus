export const RESET = 'RESET';
export const SET_SEMESTER = 'SET_SEMESTER';


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
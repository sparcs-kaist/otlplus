export const RESET = 'RESET';
export const SET_LECTURE_SELECTED = 'SET_LECTURE_SELECTED';
export const CLEAR_LECTURE_SELECTED = 'CLEAR_LECTURE_SELECTED';


export function reset() {
  return {
    type: RESET,
  };
}

export function setLectureSelected(lecture) {
  return {
    type: SET_LECTURE_SELECTED,
    lecture: lecture,
  };
}

export function clearLectureSelected() {
  return {
    type: CLEAR_LECTURE_SELECTED,
  };
}

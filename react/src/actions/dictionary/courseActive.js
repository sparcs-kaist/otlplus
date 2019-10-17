export const SET_COURSE_ACTIVE = 'SET_COURSE_ACTIVE';
export const CLEAR_COURSE_ACTIVE = 'CLEAR_COURSE_ACTIVE';

export function setCourseActive(course, clicked) {
  return {
    type: SET_COURSE_ACTIVE,
    course: course,
    clicked: clicked,
  };
}

export function clearCourseActive() {
  return {
    type: CLEAR_COURSE_ACTIVE,
  };
}

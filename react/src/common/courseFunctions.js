export const isClicked = (course, courseActive) => (
  courseActive.course
  && courseActive.clicked === true
  && courseActive.course.id === course.id
);

export const isHover = (course, courseActive) => (
  courseActive.course
  && courseActive.clicked === false
  && courseActive.course.id === course.id
);

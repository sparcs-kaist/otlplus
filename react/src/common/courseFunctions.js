import i18n from 'i18next';


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

export const isInactiveCourse = (course, courseActive) => (
  courseActive.clicked === true
  && (courseActive.course.id !== course.id)
);

export const getProfessorsStr = (course) => {
  // eslint-disable-next-line fp/no-mutating-methods
  const professors = course.professors
    .slice()
    .sort((a, b) => (a.name < b.name ? -1 : 1));
  const professorNames = professors.map(p => p[i18n.t('js.property.name')]);
  return professorNames.join(', ');
};

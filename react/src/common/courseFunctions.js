import i18n from 'i18next';


export const isClicked = (course, courseFocus) => (
  courseFocus.course
  && courseFocus.clicked === true
  && courseFocus.course.id === course.id
);

export const isHover = (course, courseFocus) => (
  courseFocus.course
  && courseFocus.clicked === false
  && courseFocus.course.id === course.id
);

export const isInactiveCourse = (course, courseFocus) => (
  courseFocus.clicked === true
  && (courseFocus.course.id !== course.id)
);

export const getProfessorsStr = (course) => {
  // eslint-disable-next-line fp/no-mutating-methods
  const professors = course.professors
    .slice()
    .sort((a, b) => (a.name < b.name ? -1 : 1));
  const professorNames = professors.map(p => p[i18n.t('js.property.name')]);
  return professorNames.join(', ');
};

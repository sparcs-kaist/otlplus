import i18n from 'i18next';

import { LectureFocusFrom } from '../reducers/timetable/lectureFocus';

import { getStr as getStrOfExamtime } from './examtimeUtils';


export const isSpecialLecture = (lecture) => {
  const isNormalLecture = (
    (lecture.class_title === lecture.class_no)
      || (lecture.class_title === 'A' && !lecture.class_no)
  );
  return !isNormalLecture;
};

export const inTimetable = (lecture, timetable) => (
  timetable
  && timetable.lectures.some((l) => (l.id === lecture.id))
);

export const inCart = (lecture, cart) => (
  cart.lectureGroups !== null
  && cart.lectureGroups.some((lg) => (
    lg.some((l) => (
      l.id === lecture.id
    ))
  ))
);

export const isListClicked = (lecture, lectureFocus) => (
  lectureFocus.from === LectureFocusFrom.LIST
  && lectureFocus.clicked === true
  && lectureFocus.lecture.id === lecture.id
);

export const isListFocused = (lecture, lectureFocus) => (
  lectureFocus.from === LectureFocusFrom.LIST
  && lectureFocus.lecture.id === lecture.id
);

export const isTableClicked = (lecture, lectureFocus) => (
  lectureFocus.from === LectureFocusFrom.TABLE
  && lectureFocus.clicked === true
  && lectureFocus.lecture.id === lecture.id
);

export const isTableFocused = (lecture, lectureFocus) => (
  lectureFocus.from === LectureFocusFrom.TABLE
  && lectureFocus.lecture.id === lecture.id
);

export const isSingleFocused = (lecture, lectureFocus) => (
  lectureFocus.lecture !== null
  && lectureFocus.lecture.id === lecture.id
);

export const isMultipleFocused = (lecture, lectureFocus) => (
  lectureFocus.from === LectureFocusFrom.MULTIPLE
  && lectureFocus.multipleDetails.some((d) => (d.lecture.id === lecture.id))
);

export const isDimmedTableLecture = (lecture, lectureFocus) => (
  lectureFocus.clicked === true
  && (lectureFocus.lecture.id !== lecture.id)
);

export const isDimmedListLectureGroup = (lectureGroup, lectureFocus) => (
  lectureFocus.clicked === true
  && (
    lectureGroup.every((l) => (lectureFocus.lecture.id !== l.id))
    || (lectureFocus.from !== LectureFocusFrom.LIST)
  )
);

export const isFocused = (lecture, lectureFocus) => (
  isSingleFocused(lecture, lectureFocus)
  || isMultipleFocused(lecture, lectureFocus)
);

export const getOverallLectures = (selectedTimetable, lectureFocus) => {
  const timetableLectures = selectedTimetable
    ? selectedTimetable.lectures
    : [];
  const hasSingleFocusedLectureOutsideTable = (
    lectureFocus.lecture
    && !inTimetable(lectureFocus.lecture, selectedTimetable)
  );

  return timetableLectures
    .concat(hasSingleFocusedLectureOutsideTable ? [lectureFocus.lecture] : []);
};

// SYNC: Keep synchronized with Django apps/subject/models.py Lecture.get_professors_short_str()
export const getProfessorsShortStr = (lecture) => {
  // eslint-disable-next-line fp/no-mutating-methods
  const professors = lecture.professors
    .slice()
    .sort((a, b) => (a.name < b.name ? -1 : 1));
  const professorNames = professors.map((p) => p[i18n.t('js.property.name')]);
  if (professorNames.length <= 2) {
    return professorNames.join(', ');
  }
  return i18n.t('ui.others.sthAndNumOtherPeople', { something: professorNames[0], count: professorNames.length - 1 });
};

export const getProfessorsFullStr = (lecture) => {
  // eslint-disable-next-line fp/no-mutating-methods
  const professors = lecture.professors
    .slice()
    .sort((a, b) => (a.name < b.name ? -1 : 1));
  const professorNames = professors.map((p) => p[i18n.t('js.property.name')]);
  return professorNames.join(', ');
};

export const getBuildingStr = (lecture) => {
  const { classtimes } = lecture;
  if (classtimes.length === 0) {
    return i18n.t('ui.placeholder.unknown');
  }
  return classtimes[0].building_code;
};

export const getClassroomStr = (lecture) => {
  const { classtimes } = lecture;
  if (classtimes.length === 0) {
    return i18n.t('ui.placeholder.unknown');
  }
  return classtimes[0][i18n.t('js.property.classroom')];
};

export const getRoomStr = (lecture) => {
  const { classtimes } = lecture;
  if (classtimes.length === 0) {
    return i18n.t('ui.placeholder.unknown');
  }
  return classtimes[0][i18n.t('js.property.room_name')];
};

export const getExamFullStr = (lecture) => {
  const { examtimes } = lecture;
  const examStrings = examtimes.map((e) => getStrOfExamtime(e));
  if (examStrings.length === 0) {
    return i18n.t('ui.placeholder.unknown');
  }
  return examStrings.join(', ');
};

export const getColorNumber = (lecture) => (
  (lecture.course % 16) + 1
);

export const getSyllabusUrl = (lecture) => (
  `https://cais.kaist.ac.kr/syllabusInfo?year=${lecture.year}&term=${lecture.semester}&subject_no=${lecture.code}&lecture_class=${lecture.class_no}&dept_id=${lecture.department}`
);

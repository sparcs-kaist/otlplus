import axios from 'axios';
import ReactGA from 'react-ga';
import i18n from 'i18next';

import { LIST, TABLE, MULTIPLE } from '../reducers/timetable/lectureFocus';

import { getStr as getStrOfExamtime } from './examtimeFunctions';


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
  lectureFocus.from === LIST
  && lectureFocus.clicked === true
  && lectureFocus.lecture.id === lecture.id
);

export const isListFocused = (lecture, lectureFocus) => (
  lectureFocus.from === LIST
  && lectureFocus.lecture.id === lecture.id
);

export const isTableClicked = (lecture, lectureFocus) => (
  lectureFocus.from === TABLE
  && lectureFocus.clicked === true
  && lectureFocus.lecture.id === lecture.id
);

export const isTableFocused = (lecture, lectureFocus) => (
  lectureFocus.from === TABLE
  && lectureFocus.lecture.id === lecture.id
);

export const isSingleFocused = (lecture, lectureFocus) => (
  lectureFocus.lecture !== null
  && lectureFocus.lecture.id === lecture.id
);

export const isMultipleFocused = (lecture, lectureFocus) => (
  lectureFocus.from === MULTIPLE
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
    || (lectureFocus.from !== LIST)
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

export const performAddToTable = (caller,
  lecture, selectedTimetable, user, fromString,
  addLectureToTimetableDispatch) => {
  if (
    lecture.classtimes.some((ct1) => (
      selectedTimetable.lectures.some((l) => (
        l.classtimes.some((ct2) => (
          (ct2.day === ct1.day)
          && (ct2.begin < ct1.end)
          && (ct2.end > ct1.begin)
        ))
      ))
    ))
  ) {
    // eslint-disable-next-line no-alert
    alert(i18n.t('ui.message.timetableOverlap'));
    return;
  }

  if (!user) {
    addLectureToTimetableDispatch(lecture);
  }
  else {
    axios.post(
      `/api/users/${user.id}/timetables/${selectedTimetable.id}/add-lecture`,
      {
        lecture: lecture.id,
      },
      {
        metadata: {
          gaCategory: 'Timetable',
          gaVariable: 'POST Update / Instance',
        },
      },
    )
      .then((response) => {
        const newProps = caller.props;
        if (!newProps.selectedTimetable || newProps.selectedTimetable.id !== selectedTimetable.id) {
          return;
        }
        // TODO: Fix timetable not updated when semester unchanged and timetable changed
        addLectureToTimetableDispatch(lecture);
      })
      .catch((error) => {
      });
  }

  ReactGA.event({
    category: 'Timetable - Lecture',
    action: 'Added Lecture to Timetable',
    label: `Lecture : ${lecture.id} / From : ${fromString}`,
  });
};

export const performDeleteFromTable = (caller,
  lecture, selectedTimetable, user, fromString,
  removeLectureFromTimetableDispatch) => {
  if (!user) {
    removeLectureFromTimetableDispatch(lecture);
  }
  else {
    axios.post(
      `/api/users/${user.id}/timetables/${selectedTimetable.id}/remove-lecture`,
      {
        lecture: lecture.id,
      },
      {
        metadata: {
          gaCategory: 'Timetable',
          gaVariable: 'POST Update / Instance',
        },
      },
    )
      .then((response) => {
        const newProps = caller.props;
        if (!newProps.selectedTimetable || newProps.selectedTimetable.id !== selectedTimetable.id) {
          return;
        }
        // TODO: Fix timetable not updated when semester unchanged and timetable changed
        removeLectureFromTimetableDispatch(lecture);
      })
      .catch((error) => {
      });
  }

  ReactGA.event({
    category: 'Timetable - Lecture',
    action: 'Deleted Lecture from Timetable',
    label: `Lecture : ${lecture.id} / From : ${fromString}`,
  });
};

export const performAddToCart = (caller,
  lecture, year, semester, user, fromString,
  addLectureToCartDispatch) => {
  if (!user) {
    addLectureToCartDispatch(lecture);
  }
  else {
    axios.post(
      `/api/users/${user.id}/wishlist/add-lecture`,
      {
        lecture: lecture.id,
      },
      {
        metadata: {
          gaCategory: 'Wishlist',
          gaVariable: 'POST Update / Instance',
        },
      },
    )
      .then((response) => {
        const newProps = caller.props;
        if (newProps.year !== year || (newProps.semester !== semester)
        ) {
          return;
        }
        addLectureToCartDispatch(lecture);
      })
      .catch((error) => {
      });
  }

  ReactGA.event({
    category: 'Timetable - Lecture',
    action: 'Added Lecture to Cart',
    label: `Lecture : ${lecture.id} / From : ${fromString}`,
  });
};

export const performDeleteFromCart = (caller,
  lecture, year, semester, user, fromString,
  deleteLectureFromCartDispatch) => {
  if (!user) {
    deleteLectureFromCartDispatch(lecture);
  }
  else {
    axios.post(
      `/api/users/${user.id}/wishlist/remove-lecture`,
      {
        lecture: lecture.id,
      },
      {
        metadata: {
          gaCategory: 'Wishlist',
          gaVariable: 'POST Update / Instance',
        },
      },
    )
      .then((response) => {
        const newProps = caller.props;
        if (newProps.year !== year || newProps.semester !== semester) {
          return;
        }
        deleteLectureFromCartDispatch(lecture);
      })
      .catch((error) => {
      });
  }

  ReactGA.event({
    category: 'Timetable - Lecture',
    action: 'Deleted Lecture from Cart',
    label: `Lecture : ${lecture.id} / From : ${fromString}`,
  });
};

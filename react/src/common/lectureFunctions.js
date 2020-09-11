import axios from 'axios';
import i18n from 'i18next';

import { LIST, TABLE, MULTIPLE } from '../reducers/timetable/lectureActive';


export const inTimetable = (lecture, timetable) => (
  timetable
  && timetable.lectures.some(l => (l.id === lecture.id))
);

export const inCart = (lecture, cart) => (
  cart.courses !== null
  && cart.courses.some(course => (
    course.some(cartLecture => (
      cartLecture.id === lecture.id
    ))
  ))
);

export const isListClicked = (lecture, lectureActive) => (
  lectureActive.from === LIST
  && lectureActive.clicked === true
  && lectureActive.lecture.id === lecture.id
);

export const isListHover = (lecture, lectureActive) => (
  lectureActive.from === LIST
  && lectureActive.clicked === false
  && lectureActive.lecture.id === lecture.id
);

export const isTableClicked = (lecture, lectureActive) => (
  lectureActive.from === TABLE
  && lectureActive.clicked === true
  && lectureActive.lecture.id === lecture.id
);

export const isTableHover = (lecture, lectureActive) => (
  lectureActive.from === TABLE
  && lectureActive.clicked === false
  && lectureActive.lecture.id === lecture.id
);

export const isInMultiple = (lecture, lectureActive) => (
  lectureActive.from === MULTIPLE
  && lectureActive.multipleDetail.some(l => (l.id === lecture.id))
);

export const isInactiveTableLecture = (lecture, lectureActive) => (
  lectureActive.clicked === true
  && ((lectureActive.lecture.id !== lecture.id) || (lectureActive.from !== TABLE))
);

export const isInactiveListLectures = (lectures, lectureActive) => (
  lectureActive.clicked === true
  && (lectures.every(l => (lectureActive.lecture.id !== l.id)) || (lectureActive.from !== LIST))
);

export const isActive = (lecture, lectureActiveLecture, activeLectures) => {
  return (lectureActiveLecture !== null && lectureActiveLecture.id === lecture.id)
    || (activeLectures.some(l => (l.id === lecture.id)));
};

export const getProfessorsStrShort = (lecture) => {
  // eslint-disable-next-line fp/no-mutating-methods
  const professors = lecture.professors
    .slice()
    .sort((a, b) => (a.name < b.name ? -1 : 1));
  const professorNames = professors.map(p => p[i18n.t('js.property.name')]);
  if (professorNames.length <= 2) {
    return professorNames.join(', ');
  }
  return i18n.t('ui.others.sthAndNumOtherPeople', { something: professorNames[0], count: professorNames.length - 1 });
};

export const getBuildingStr = (lecture) => {
  const { classtimes } = lecture;
  if (classtimes.length === 0) {
    return i18n.t('ui.placeholder.unknown');
  }
  return classtimes[0].building;
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
  return classtimes[0][i18n.t('js.property.room')];
};

export const getExamStr = (lecture) => {
  const { examtimes } = lecture;
  const examStrings = examtimes.map(e => e[i18n.t('js.property.str')]);
  if (examStrings.length === 0) {
    return i18n.t('ui.placeholder.unknown');
  }
  if (examStrings.length === 1) {
    return examStrings[0];
  }
  return i18n.t('ui.others.sthAndNumOthers', { something: examStrings[0], count: examStrings.length - 1 });
};

export const performAddToTable = (caller, lecture, currentTimetable, user, addLectureToTimetableDispatch) => {
  if (
    lecture.classtimes.some(thisClasstime => (
      currentTimetable.lectures.some(timetableLecture => (
        timetableLecture.classtimes.some(classtime => (
          (classtime.day === thisClasstime.day)
          && (classtime.begin < thisClasstime.end)
          && (classtime.end > thisClasstime.begin)
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
    return;
  }

  axios.post(
    `/api/users/${user.id}/timetables/${currentTimetable.id}/add-lecture`,
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
      if (!newProps.currentTimetable || newProps.currentTimetable.id !== currentTimetable.id) {
        return;
      }
      // TODO: Fix timetable not updated when semester unchanged and timetable changed
      addLectureToTimetableDispatch(lecture);
    })
    .catch((error) => {
    });
};

export const performDeleteFromTable = (caller, lecture, currentTimetable, user, removeLectureFromTimetableDispatch) => {
  if (!user) {
    removeLectureFromTimetableDispatch(lecture);
    return;
  }

  axios.post(
    `/api/users/${user.id}/timetables/${currentTimetable.id}/remove-lecture`,
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
      if (!newProps.currentTimetable || newProps.currentTimetable.id !== currentTimetable.id) {
        return;
      }
      // TODO: Fix timetable not updated when semester unchanged and timetable changed
      removeLectureFromTimetableDispatch(lecture);
    })
    .catch((error) => {
    });
};

export const performAddToCart = (caller, lecture, year, semester, user, addLectureToCartDispatch) => {
  if (!user) {
    addLectureToCartDispatch(lecture);
    return;
  }

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
};

export const performDeleteFromCart = (caller, lecture, year, semester, user, deleteLectureFromCartDispatch) => {
  if (!user) {
    deleteLectureFromCartDispatch(lecture);
    return;
  }

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
};

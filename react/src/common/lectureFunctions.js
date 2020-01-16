import { LIST, TABLE, MULTIPLE } from '../reducers/timetable/lectureActive';
import axios, { BASE_URL } from './presetAxios';


export const inTimetable = (lecture, timetable) => (
  timetable !== null
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

export const performAddToTable = (caller, lecture, currentTimetable, user, addLectureToTimetableDispatch) => {
  if (
    lecture.classtimes.some(thisClasstime => (
      currentTimetable.lectures.some(timetableLecture => (
        timetableLecture.classtimes.some(classtime => (
          (classtime.day === thisClasstime.day) && (classtime.begin < thisClasstime.end) && (classtime.end > thisClasstime.begin)
        ))
      ))
    ))
  ) {
    // eslint-disable-next-line no-alert
    alert(caller.props.t('ui.message.timetableOverlap'));
    return;
  }

  if (!user) {
    addLectureToTimetableDispatch(lecture);
    return;
  }

  axios.post(`${BASE_URL}/api/timetable/table_update`, {
    table_id: currentTimetable.id,
    lecture_id: lecture.id,
    delete: false,
  })
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

  axios.post(`${BASE_URL}/api/timetable/table_update`, {
    table_id: currentTimetable.id,
    lecture_id: lecture.id,
    delete: true,
  })
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

  axios.post(`${BASE_URL}/api/timetable/wishlist_update`, {
    lecture_id: lecture.id,
    delete: false,
  })
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

  axios.post(`${BASE_URL}/api/timetable/wishlist_update`, {
    lecture_id: lecture.id,
    delete: true,
  })
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

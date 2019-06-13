import { NONE, LIST, TABLE, MULTIPLE } from '../reducers/timetable/lectureActive';


export const inTimetable = (lecture, timetable) => (
  timetable.lectures.some(l => (l.id === lecture.id))
);

export const inCart = (lecture, cart) => (
  cart.courses.some(course => (
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

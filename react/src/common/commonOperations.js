import axios from 'axios';
import ReactGA from 'react-ga';
import i18n from 'i18next';


export const performSearchCourses = (
  option, limit,
  beforeRequest, afterResponse,
) => {
  if (
    (!option.keyword || (option.keyword.length === 0))
    && (!option.type || option.type.includes('ALL'))
    && (!option.department || option.department.includes('ALL'))
    && (!option.grade || option.grade.includes('ALL'))
    // Should not check for option.term
  ) {
    // eslint-disable-next-line no-alert
    alert(i18n.t('ui.message.blankSearch'));
    return;
  }

  beforeRequest();
  axios.get(
    '/api/courses',
    {
      params: {
        ...option,
        order: ['old_code'],
        limit: limit,
      },
      metadata: {
        gaCategory: 'Course',
        gaVariable: 'GET / List',
      },
    },
  )
    .then((response) => {
      afterResponse(response.data);
    })
    .catch((error) => {
    });
};


export const performAddToTable = (
  lecture, selectedTimetable, user, fromString,
  beforeRequest, afterResponse,
) => {
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

  beforeRequest();

  if (!user) {
    afterResponse();
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
        afterResponse();
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


export const performDeleteFromTable = (
  lecture, selectedTimetable, user, fromString,
  beforeRequest, afterResponse,
) => {
  beforeRequest();

  if (!user) {
    afterResponse();
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
        afterResponse();
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


export const performAddToCart = (
  lecture, user, fromString,
  beforeRequest, afterResponse,
) => {
  beforeRequest();

  if (!user) {
    afterResponse();
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
        afterResponse();
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


export const performDeleteFromCart = (
  lecture, user, fromString,
  beforeRequest, afterResponse,
) => {
  beforeRequest();

  if (!user) {
    afterResponse();
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
        afterResponse();
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


export const performSubmitReview = (
  existingReview,
  lecture, content, grade, speech, load,
  isUploading,
  fromString,
  beforeRequest, afterResponse,
) => {
  if (content.length === 0) {
    // eslint-disable-next-line no-alert
    alert(i18n.t('ui.message.emptyContent'));
    return;
  }
  if ((grade === undefined) || (load === undefined) || (speech === undefined)) {
    // eslint-disable-next-line no-alert
    alert(i18n.t('ui.message.scoreNotSelected'));
    return;
  }
  if (isUploading) {
    // eslint-disable-next-line no-alert
    alert(i18n.t('ui.message.alreadyUploading'));
    return;
  }

  beforeRequest();

  if (!existingReview) {
    axios.post(
      '/api/reviews',
      {
        lecture: lecture.id,
        content: content,
        grade: grade,
        speech: speech,
        load: load,
      },
      {
        metadata: {
          gaCategory: 'Review',
          gaVariable: 'POST / List',
        },
      },
    )
      .then((response) => {
        afterResponse(response.data);
      })
      .catch((error) => {
      });

    ReactGA.event({
      category: 'Review',
      action: 'Uploaded Review',
      label: `Lecture : ${lecture.id} / From : ${fromString}`,
    });
  }
  else {
    axios.patch(
      `/api/reviews/${existingReview.id}`,
      {
        content: content,
        grade: grade,
        speech: speech,
        load: load,
      },
      {
        metadata: {
          gaCategory: 'Review',
          gaVariable: 'POST / List',
        },
      },
    )
      .then((response) => {
        afterResponse(response.data);
      })
      .catch((error) => {
      });

    ReactGA.event({
      category: 'Review',
      action: 'Edited Review',
      label: `Lecture : ${lecture.id} / From : ${fromString}`,
    });
  }
};

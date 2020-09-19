import axios from 'axios';
import ReactGA from 'react-ga';

// eslint-disable-next-line import/prefer-default-export
export const performSubmitReview = (
  existingReview,
  lecture, content, grade, speech, load,
  fromString,
  onResponse,
) => {
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
        onResponse(response);
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
        onResponse(response);
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

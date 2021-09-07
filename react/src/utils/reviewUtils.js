import axios from 'axios';
import ReactGA from 'react-ga';
import i18n from 'i18next';

// eslint-disable-next-line import/prefer-default-export
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
        afterResponse(response);
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
        afterResponse(response);
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

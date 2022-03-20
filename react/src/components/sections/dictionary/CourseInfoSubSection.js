import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import courseFocusShape from '../../../shapes/state/CourseFocusShape';

import { getAverageScoreLabel } from '../../../utils/scoreUtils';
import Attributes from '../../Attributes';
import Scores from '../../Scores';

class CourseInfoSubSection extends Component {
  render() {
    const { t } = this.props;
    const { courseFocus } = this.props;

    if (!courseFocus.course) {
      return null;
    }

    const representativeLecture =
      courseFocus.lectures && courseFocus.lectures.length > 0
        ? courseFocus.lectures[courseFocus.lectures.length - 1]
        : null;

    return (
      <div className={classNames('subsection', 'subsection--course-info')}>
        <Attributes
          entries={[
            {
              name: t('ui.attribute.classification'),
              info: `${courseFocus.course.department[t('js.property.name')]}, ${
                courseFocus.course[t('js.property.type')]
              }`,
            },
            { name: t('ui.attribute.description'), info: courseFocus.course.summary },
          ]}
          longInfo
        />
        <Scores
          entries={[
            {
              name: t('ui.score.lectureHours'),
              score: representativeLecture ? representativeLecture.num_classes : '-',
            },
            {
              name: t('ui.score.labHours'),
              score: representativeLecture ? representativeLecture.num_labs : '-',
            },
            {
              name: representativeLecture
                ? representativeLecture.credit === 0
                  ? t('ui.score.au')
                  : t('ui.score.credit')
                : t('ui.score.credit'),
              score: representativeLecture
                ? representativeLecture.credit === 0
                  ? representativeLecture.credit_au
                  : representativeLecture.credit
                : '-',
            },
          ]}
          big
        />
        <Scores
          entries={[
            { name: t('ui.score.grade'), score: getAverageScoreLabel(courseFocus.course.grade) },
            { name: t('ui.score.load'), score: getAverageScoreLabel(courseFocus.course.load) },
            { name: t('ui.score.speech'), score: getAverageScoreLabel(courseFocus.course.speech) },
          ]}
          big
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  courseFocus: state.dictionary.courseFocus,
});

const mapDispatchToProps = (dispatch) => ({});

CourseInfoSubSection.propTypes = {
  courseFocus: courseFocusShape.isRequired,
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(CourseInfoSubSection),
);

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import courseFocusShape from '../../../../shapes/state/dictionary/CourseFocusShape';

import { getAverageScoreLabel } from '../../../../utils/scoreUtils';
import Attributes from '../../../Attributes';
import Scores from '../../../Scores';


class CourseInfoSubSection extends Component {
  render() {
    const { t } = this.props;
    const { courseFocus } = this.props;

    if (!courseFocus.course) {
      return null;
    }

    return (
      <div className={classNames('subsection', 'subsection--course-info')}>
        <Attributes
          entries={[
            {
              name: t('ui.attribute.classification'),
              info: `${courseFocus.course.department[t('js.property.name')]}, ${courseFocus.course[t('js.property.type')]}`,
            },
            {
              name: t('ui.attribute.description'),
              info: courseFocus.course.summary,
            },
          ]}
          longInfo
        />
        <Scores
          entries={[
            {
              name: t('ui.score.lectureHours'),
              score: courseFocus.course.num_classes,
            },
            {
              name: t('ui.score.labHours'),
              score: courseFocus.course.num_labs,
            },
            {
              name: (courseFocus.course.credit === 0)
                ? t('ui.score.au')
                : t('ui.score.credit'),
              score: (courseFocus.course.credit === 0)
                ? courseFocus.course.credit_au
                : courseFocus.course.credit,
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

const mapDispatchToProps = (dispatch) => ({
});

CourseInfoSubSection.propTypes = {
  courseFocus: courseFocusShape.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    CourseInfoSubSection
  )
);

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
    
    const lastLecture = (
      courseFocus.lectures ? (courseFocus.lectures[courseFocus.lectures.length-1]) : null
    )

    return (
      <div className={classNames('subsection', 'subsection--course-info')}>
        <Attributes
          entries={[
            { name: t('ui.attribute.classification'), info: `${courseFocus.course.department[t('js.property.name')]}, ${courseFocus.course[t('js.property.type')]}` },
            { name: t('ui.attribute.description'), info: courseFocus.course.summary },
          ]}
          longInfo
        />
        <Scores
          entries={[
            { name: t('ui.score.grade'), score: getAverageScoreLabel(courseFocus.course.grade) },
            { name: t('ui.score.load'), score: getAverageScoreLabel(courseFocus.course.load) },
            { name: t('ui.score.speech'), score: getAverageScoreLabel(courseFocus.course.speech) },
          ]}
          big
        />
        <Scores
          entries={[
            { name: t('ui.score.classes'), score: lastLecture ? lastLecture.num_classes : '-' },
            { name: t('ui.score.labs'), score: lastLecture ? lastLecture.num_labs : '-' },
            { name: lastLecture ? lastLecture.credit > 0 ? t('ui.score.credit') : t('ui.score.au') : t('ui.score.credit'),
              score: lastLecture ? lastLecture.credit > 0 ? lastLecture.credit : lastLecture.credit_au : '-'}
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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import courseFocusShape from '../../../shapes/CourseFocusShape';

import { getAverageScoreLabel } from '../../../utils/scoreUtils';
import Attributes from '../../Attributes';


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
          rows={[
            { name: t('ui.attribute.classification'), info: `${courseFocus.course.department[t('js.property.name')]}, ${courseFocus.course[t('js.property.type')]}` },
            { name: t('ui.attribute.description'), info: courseFocus.course.summary },
          ]}
          longInfo
        />
        <div className={classNames('scores')} ref={this.scoresRef}>
          <div>
            <div>{ getAverageScoreLabel(courseFocus.course.grade) }</div>
            <div>{ t('ui.score.grade') }</div>
          </div>
          <div>
            <div>{ getAverageScoreLabel(courseFocus.course.load) }</div>
            <div>{ t('ui.score.load') }</div>
          </div>
          <div>
            <div>{ getAverageScoreLabel(courseFocus.course.speech) }</div>
            <div>{ t('ui.score.speech') }</div>
          </div>
        </div>
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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import courseFocusShape from '../../../shapes/CourseFocusShape';

import { getAverageScoreLabel } from '../../../utils/scoreUtils';


class CourseInfoSubSection extends Component {
  render() {
    const { t } = this.props;
    const { courseFocus } = this.props;

    if (!courseFocus.course) {
      return null;
    }

    return (
      <div className={classNames('subsection', 'subsection--course-info')}>
        <div>
          <div className={classNames('attribute', 'attribute--long-info')}>
            <div>{ t('ui.attribute.classification') }</div>
            <div>{ `${courseFocus.course.department[t('js.property.name')]}, ${courseFocus.course[t('js.property.type')]}` }</div>
          </div>
          <div className={classNames('attribute', 'attribute--long-info')}>
            <div>{ t('ui.attribute.description') }</div>
            <div>{ courseFocus.course.summary }</div>
          </div>
        </div>
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

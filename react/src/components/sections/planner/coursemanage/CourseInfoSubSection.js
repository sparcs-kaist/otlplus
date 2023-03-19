import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import itemFocusShape from '../../../../shapes/state/ItemFocusShape';

import { getAverageScoreLabel } from '../../../../utils/scoreUtils';
import Attributes from '../../../Attributes';
import Scores from '../../../Scores';


class CourseInfoSubSection extends Component {
  render() {
    const { t } = this.props;
    const { itemFocus } = this.props;

    if (!itemFocus.course || !itemFocus.lectures) {
      return null;
    }

    const recentLecture = itemFocus.lectures[itemFocus.lectures.length - 1];

    return (
      <div className={classNames('subsection', 'subsection--course-info')}>
        <Attributes
          entries={[
            { name: t('ui.attribute.classification'), info: `${itemFocus.course.department[t('js.property.name')]}, ${itemFocus.course[t('js.property.type')]}` },
            { name: t('ui.attribute.description'), info: itemFocus.course.summary },
          ]}
          longInfo
        />
        <Scores
          entries={[
            { name: t('ui.score.numClasses'), score: recentLecture ? recentLecture.num_classes : '-' },
            { name: t('ui.score.numLabs'), score: recentLecture ? recentLecture.num_labs : '-' },
            recentLecture.credit >= 1
              ? { name: t('ui.score.credit'), score: recentLecture.credit }
              : { name: t('ui.score.au'), score: recentLecture ? recentLecture.credit_au : '-' },
          ]}
          big
        />
        <Scores
          entries={[
            { name: t('ui.score.grade'), score: getAverageScoreLabel(itemFocus.course.grade) },
            { name: t('ui.score.load'), score: getAverageScoreLabel(itemFocus.course.load) },
            { name: t('ui.score.speech'), score: getAverageScoreLabel(itemFocus.course.speech) },
          ]}
          big
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  itemFocus: state.planner.itemFocus,
});

const mapDispatchToProps = (dispatch) => ({
});

CourseInfoSubSection.propTypes = {
  itemFocus: itemFocusShape.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    CourseInfoSubSection
  )
);

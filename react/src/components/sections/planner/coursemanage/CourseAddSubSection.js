/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { range } from 'lodash';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';
import Scroller from '../../../Scroller';

import plannerShape from '../../../../shapes/model/PlannerShape';

import { getSemesterName } from '../../../../utils/semesterUtils';
import Attributes from '../../../Attributes';


class CourseCustomizeSubSection extends Component {
  render() {
    const { t, selectedPlanner } = this.props;

    if (!selectedPlanner) {
      return null;
    }

    const plannerYears = range(selectedPlanner.start_year, selectedPlanner.end_year + 1);

    const sectionHead = (
      <>
        <div className={classNames('detail-title-area')}>
          <div className={classNames('title')}>{t('ui.title.lectureInformation')}</div>
          <div className={classNames('subtitle')}>수강 추가</div>
          <div className={classNames('buttons')}>
            &nbsp;
          </div>
        </div>
      </>
    );
    const sectionBody = (
      <>
        <Scroller>
          <Attributes
            entries={
              plannerYears.map((y) => (
                [1, 3].map((s) => ({
                  name: `${y} ${getSemesterName(s)}`,
                  info: '추가하기',
                }))
              )).flat()
            }
            fixedWidthName
          />
        </Scroller>
      </>
    );

    return (
      <div className={classNames('subsection', 'subsection--course-info-setting')}>
        {sectionHead}
        {sectionBody}
      </div>
    );
  }
}


const mapStateToProps = (state) => ({
  selectedPlanner: state.planner.planner.selectedPlanner,
});

CourseCustomizeSubSection.propTypes = {
  selectedPlanner: plannerShape,
};


export default withTranslation()(
  connect(mapStateToProps)(
    CourseCustomizeSubSection
  )
);

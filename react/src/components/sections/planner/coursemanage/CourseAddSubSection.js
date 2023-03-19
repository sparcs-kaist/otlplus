import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import { range } from 'lodash';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';
import Scroller from '../../../Scroller';

import userShape from '../../../../shapes/model/UserShape';
import plannerShape from '../../../../shapes/model/PlannerShape';
import itemFocusShape from '../../../../shapes/state/ItemFocusShape';

import { getSemesterName } from '../../../../utils/semesterUtils';
import Attributes from '../../../Attributes';
import { addCourseToPlanner } from '../../../../actions/planner/planner';


class CourseCustomizeSubSection extends Component {
  addCourseToPlanner = (course, year, semester) => {
    const {
      user,
      selectedPlanner,
      addCourseToPlannerDispatch,
    } = this.props;

    if (!user) {
      addCourseToPlannerDispatch(course, year, semester);
    }
    else {
      axios.post(
        `/api/users/${user.id}/planners/${selectedPlanner.id}/add-course`,
        {
          course: course.id,
          year: year,
          semester: semester,
        },
        {
          metadata: {
            gaCategory: 'Timetable',
            gaVariable: 'POST Update / Instance',
          },
        },
      )
        .then((response) => {
          const newProps = this.props;
          if (!newProps.selectedPlanner || newProps.selectedPlanner.id !== selectedPlanner.id) {
            return;
          }
          addCourseToPlannerDispatch(course, year, semester);
        })
        .catch((error) => {
        });
    }
  }


  render() {
    const { t, selectedPlanner, itemFocus } = this.props;

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
                  onInfoClick: () => this.addCourseToPlanner(itemFocus.course, y, s),
                }))
              )).flat()
            }
            fixedWidthName
          />
        </Scroller>
      </>
    );

    return (
      <div className={classNames('subsection', 'subsection--course-manage-right')}>
        {sectionHead}
        {sectionBody}
      </div>
    );
  }
}


const mapStateToProps = (state) => ({
  user: state.common.user.user,
  selectedPlanner: state.planner.planner.selectedPlanner,
  itemFocus: state.planner.itemFocus,
});

const mapDispatchToProps = (dispatch) => ({
  addCourseToPlannerDispatch: (course, year, semester) => {
    dispatch(addCourseToPlanner(course, year, semester));
  },
});

CourseCustomizeSubSection.propTypes = {
  user: userShape,
  selectedPlanner: plannerShape,
  itemFocus: itemFocusShape,

  addCourseToPlannerDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    CourseCustomizeSubSection
  )
);

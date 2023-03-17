import React, { Component } from 'react';
import { connect } from 'react-redux';
import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';
import Divider from '../../../Divider';
import CourseInfoSubSection from './CourseInfoSubSection';
import CourseSettingSubSection from './CourseSettingSubSection';
import OtlplusPlaceholder from '../../../OtlplusPlaceholder';
import courseFocusShape from '../../../../shapes/state/CourseFocusShape';

class CourseManageSection extends Component {
  render() {
    const { courseFocus } = this.props;
    const sectionContent = courseFocus.course
      ? (
        <>
          <CourseInfoSubSection />
          <Divider orientation={{ desktop: Divider.Orientation.VERTICAL, mobile: Divider.Orientation.HORIZONTAL }} isVisible={true} gridArea="divider-main" />
          <CourseSettingSubSection />
        </>
      )
      : (
        <OtlplusPlaceholder />
      );
    return (
      <div className={classNames('section', 'section--course-manage')}>
        {sectionContent}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  courseFocus: state.planner.courseFocus,
});

CourseManageSection.propTypes = {
  courseFocus: courseFocusShape.isRequired,
};

export default (
  connect(mapStateToProps)(
    CourseManageSection
  )
);

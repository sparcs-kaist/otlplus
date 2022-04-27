import React, { Component } from 'react';
import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import { connect } from 'react-redux';
import Divider from '../../Divider';
import CourseInfoSubSection from './CourseInfoSubSection';
import CourseSettingSubSection from './CourseSettingSubSection';
import OtlplusPlaceholder from '../../OtlplusPlaceholder';
import courseFocusShape from '../../../shapes/state/CourseFocusShape';
import userShape from '../../../shapes/model/UserShape';

class CourseDetailSection extends Component {
  constructor(props) {
    super(props);
  }

    render() {
    const { courseFocus } = this.props;
    const sectionContent = courseFocus.course
      ? (
        <>
            <CourseSettingSubSection/>
            <Divider orientation={{ desktop: Divider.Orientation.VERTICAL, mobile: Divider.Orientation.HORIZONTAL }} isVisible={true} gridArea="divider-main" />
            <CourseInfoSubSection/>
        </>
      ) 
      : (
        <OtlplusPlaceholder/>
      );
        return(
          <div className={classNames('section', 'section--course-info-detail')}>
              { sectionContent }
          </div>
        );
    }
}

const mapStateToProps = (state) => ({
  courseFocus: state.planner.courseFocus,
});

CourseDetailSection.propTypes = {
  courseFocus: courseFocusShape.isRequired,
};

export default (
  connect(mapStateToProps)(
    CourseDetailSection
  )
);
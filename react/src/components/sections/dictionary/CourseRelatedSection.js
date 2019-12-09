import React, { Component } from 'react';
import { connect } from 'react-redux';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import CourseSimpleBlock from '../../blocks/CourseSimpleBlock';
import CourseShape from '../../../shapes/CourseShape';
import courses from '../../../dummy/courses';


class CourseDetailSection extends Component {
  render() {
    const { course } = this.props;

    return (
      <>
        <div className={classNames('small-title')}>연관 과목</div>
        <div className={classNames('related-courses')}>
          <div>
            { courses.map(c => <CourseSimpleBlock course={c} key={c.id} />) }
          </div>
          <div>
            &gt;
          </div>
          <div>
            <CourseSimpleBlock course={course} />
          </div>
          <div>
            &gt;
          </div>
          <div>
            { courses.map(c => <CourseSimpleBlock course={c} key={c.id} />) }
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = state => ({
  course: state.dictionary.courseActive.course,
});

const mapDispatchToProps = dispatch => ({
});

CourseDetailSection.propTypes = {
  course: CourseShape,
};


export default connect(mapStateToProps, mapDispatchToProps)(CourseDetailSection);

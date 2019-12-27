import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import CourseSimpleBlock from '../../blocks/CourseSimpleBlock';
import CourseShape from '../../../shapes/CourseShape';
import courses from '../../../dummy/courses';


class CourseRelatedSubSection extends Component {
  render() {
    const { t } = this.props;
    const { course } = this.props;

    return (
      <>
        <div className={classNames('small-title')}>{t('ui.title.relatedCourses')}</div>
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

CourseRelatedSubSection.propTypes = {
  course: CourseShape,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(CourseRelatedSubSection));

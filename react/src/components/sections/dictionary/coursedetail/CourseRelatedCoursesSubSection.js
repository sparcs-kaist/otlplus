import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import Scroller from '../../../Scroller';
import CourseSimpleBlock from '../../../blocks/CourseSimpleBlock';

import courseFocusShape from '../../../../shapes/state/dictionary/CourseFocusShape';


class CourseRelatedCoursesSubSection extends Component {
  render() {
    const { t } = this.props;
    const { courseFocus } = this.props;

    if (!courseFocus.course) {
      return null;
    }

    const getBlocksOrPlaceholder = (courses) => {
      if (!courses.length) {
        return <div className={classNames('list-placeholder')}><div>{t('ui.placeholder.unknown')}</div></div>;
      }
      return courses.map((c) => <CourseSimpleBlock course={c} key={c.id} />);
    };

    return (
      <div className={classNames('subsection', 'subsection--course-related-courses')}>
        <div className={classNames('small-title')}>{t('ui.title.relatedCourses')}</div>
        <div>
          <Scroller noScrollX={false} noScrollY={true}>
            <div className={classNames('related-courses')}>
              <div>
                { getBlocksOrPlaceholder(courseFocus.course.related_courses_prior)}
              </div>
              <div>
                <i className={classNames('icon', 'icon--related-arrow')} />
              </div>
              <div>
                <CourseSimpleBlock course={courseFocus.course} />
              </div>
              <div>
                <i className={classNames('icon', 'icon--related-arrow')} />
              </div>
              <div>
                { getBlocksOrPlaceholder(courseFocus.course.related_courses_posterior) }
              </div>
            </div>
          </Scroller>
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

CourseRelatedCoursesSubSection.propTypes = {
  courseFocus: courseFocusShape.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    CourseRelatedCoursesSubSection
  )
);

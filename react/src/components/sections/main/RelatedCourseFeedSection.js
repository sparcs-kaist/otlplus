import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import qs from 'qs';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import CourseBlock from '../../blocks/CourseBlock';

import courseShape from '../../../shapes/model/subject/CourseShape';


class RelatedCourseFeedSection extends Component {
  render() {
    const { t } = this.props;
    const { course } = this.props;

    return (
    // eslint-disable-next-line react/jsx-indent
    <div className={classNames('section', 'section--feed')}>
      <div className={classNames('subsection', 'subsection--feed')}>
        <div className={classNames('title')}>
          {`${t('ui.title.relatedCourses')} - ${course[t('js.property.title')]}`}
        </div>
        { course.related_courses_posterior.length
          ? course.related_courses_posterior.map((c) => (
            <CourseBlock
              course={c}
              key={c.id}
              linkTo={{ pathname: '/dictionary', search: qs.stringify({ startCourseId: c.id }) }}
            />
          ))
          : <div className={classNames('list-placeholder')}><div>{t('ui.placeholder.unknown')}</div></div>
        }
        <div className={classNames('buttons')}>
          <Link
            to={{ pathname: '/dictionary', search: qs.stringify({ startCourseId: course.id }) }}
            className={classNames('text-button')}
          >
            {t('ui.button.seeDetails')}
          </Link>
        </div>
      </div>
    </div>
    );
  }
}

RelatedCourseFeedSection.propTypes = {
  course: courseShape.isRequired,
};


export default withTranslation()(
  RelatedCourseFeedSection
);

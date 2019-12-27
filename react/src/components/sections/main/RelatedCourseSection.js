import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import CourseBlock from '../../blocks/CourseBlock';
import courses from '../../../dummy/courses';


class RelatedCourseSection extends Component {
  render() {
    const { t } = this.props;
    const lecture = {
      title: '데이타구조',
      title_en: 'Data Structure',
    };

    return (
      <div className={classNames('section-content', 'section-content--widget')}>
        <div className={classNames('title')}>
          {`${t('ui.title.relatedCourses')} - ${lecture[t('js.property.title')]}`}
        </div>
        { courses.map(c => (
          <Link to={{ pathname: '/dictionary', state: { startCourseId: c.id } }}>
            <CourseBlock course={c} key={c.id} />
          </Link>
        ))}
        <div className={classNames('buttons')}>
          <Link to={{ pathname: '/dictionary', state: { startCourseId: 746 } }} className={classNames('text-button')}>
            {t('ui.button.seeDetails')}
          </Link>
        </div>
      </div>
    );
  }
}


export default withTranslation()(RelatedCourseSection);

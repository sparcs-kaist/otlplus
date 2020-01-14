import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import Scroller from '../../Scroller2';
import CourseSimpleBlock from '../../blocks/CourseSimpleBlock';

import CourseShape from '../../../shapes/CourseShape';


class RelatedSubSection extends Component {
  render() {
    const { t } = this.props;
    const { course } = this.props;

    return (
      <>
        <div className={classNames('small-title')}>{t('ui.title.relatedCourses')}</div>
        {/* eslint-disable-next-line react/jsx-indent */}
    <div>
      <Scroller noScrollX={false} noScrollY={true}>
        <div className={classNames('related-courses')}>
          <div>
            { course.related_courses_prior.length
              ? course.related_courses_prior.map(c => <CourseSimpleBlock course={c} key={c.id} />)
              : <div className={classNames('list-placeholder')}><div>{t('ui.placeholder.unknown')}</div></div>
            }
          </div>
          <div>
            <i className={classNames('icon', 'icon--related-arrow')} />
          </div>
          <div>
            <CourseSimpleBlock course={course} />
          </div>
          <div>
            <i className={classNames('icon', 'icon--related-arrow')} />
          </div>
          <div>
            { course.related_courses_posterior.length
              ? course.related_courses_prior.map(c => <CourseSimpleBlock course={c} key={c.id} />)
              : <div className={classNames('list-placeholder')}><div>{t('ui.placeholder.unknown')}</div></div>
            }
          </div>
        </div>
      </Scroller>
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

RelatedSubSection.propTypes = {
  course: CourseShape,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(RelatedSubSection));

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import Scroller from '../../Scroller';
import CourseSimpleBlock from '../../blocks/CourseSimpleBlock';

import courseShape from '../../../shapes/CourseShape';


class RelatedSubSection extends Component {
  render() {
    const { t } = this.props;
    const { course } = this.props;

    const getBlocksOrPlaceholder = (courses) => {
      if (!courses.length) {
        return <div className={classNames('list-placeholder')}><div>{t('ui.placeholder.unknown')}</div></div>;
      }
      return courses.map(c => <CourseSimpleBlock course={c} key={c.id} />);
    };

    return (
      <>
        <div className={classNames('small-title')}>{t('ui.title.relatedCourses')}</div>

        <div>
          <Scroller noScrollX={false} noScrollY={true}>
            <div className={classNames('related-courses')}>
              <div>
                { getBlocksOrPlaceholder(course.related_courses_prior)}
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
                { getBlocksOrPlaceholder(course.related_courses_posterior) }
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
  course: courseShape,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(RelatedSubSection));

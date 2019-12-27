import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import { clearCourseActive } from '../../../actions/dictionary/courseActive';
import Scroller from '../../Scroller';
import CourseShape from '../../../shapes/CourseShape';
import CourseRelatedSection from './CourseRelatedSection';
import CourseHistorySubSection from './CourseHistorySubSection';
import CourseReviewsSubSection from './CourseReviewsSubSection';


class CourseDetailSection extends Component {
  onScroll() {
    if (this.refs.scores.getBoundingClientRect().top >= this.refs.scrollThreshold.getBoundingClientRect().bottom) {
      this.refs.hiddenScores.classList.add('fixed__conditional-part--hidden');
    }
    else {
      this.refs.hiddenScores.classList.remove('fixed__conditional-part--hidden');
    }
  }


  unfix = () => {
    const { clearCourseActiveDispatch } = this.props;
    clearCourseActiveDispatch();
  }


  render() {
    const { t } = this.props;
    const { clicked, course } = this.props;

    if (clicked && course !== null) {
      return (
        <div className={classNames('section-content', 'section-content--flex', 'section-content--course-detail')}>
          <div className={classNames('close-button')} onClick={this.unfix}>닫기</div>
          <div className={classNames('fixed')}>
            <div>
              <div className={classNames('title')}>
                {course[t('js.property.title')]}
              </div>
              <div className={classNames('subtitle')}>
                {course.old_code}
              </div>
            </div>
            <div ref="scrollThreshold" />
            <div className={classNames('fixed__conditional-part', 'fixed__conditional-part--hidden')} ref="hiddenScores">
              <div>
                <div className={classNames('scores')}>
                  <div>
                    <div>
                      {course.grade_letter}
                    </div>
                    <div>
                      {t('ui.score.grade')}
                    </div>
                  </div>
                  <div>
                    <div>
                      {course.load_letter}
                    </div>
                    <div>
                      {t('ui.score.load')}
                    </div>
                  </div>
                  <div>
                    <div>
                      {course.speech_letter}
                    </div>
                    <div>
                      {t('ui.score.speech')}
                    </div>
                  </div>
                </div>
                <div className={classNames('divider')} />
              </div>
            </div>
          </div>
          <Scroller onScroll={() => this.onScroll()}>
            <div>
              <div className={classNames('attribute')}>
                <div>
                  {t('ui.attribute.classification')}
                </div>
                <div>
                  {`${course.department[t('js.property.name')]}, ${course[t('js.property.type')]}`}
                </div>
              </div>
              <div className={classNames('attribute')}>
                <div>
                  {t('ui.attribute.description')}
                </div>
                <div>
                  {course.summary}
                </div>
              </div>
            </div>
            <div className={classNames('scores')} ref="scores">
              <div>
                <div>
                  {course.grade_letter}
                </div>
                <div>
                  {t('ui.score.grade')}
                </div>
              </div>
              <div>
                <div>
                  {course.load_letter}
                </div>
                <div>
                  {t('ui.score.load')}
                </div>
              </div>
              <div>
                <div>
                  {course.speech_letter}
                </div>
                <div>
                  {t('ui.score.speech')}
                </div>
              </div>
            </div>
            <div className={classNames('divider')} />
            <CourseRelatedSection />
            <div className={classNames('divider')} />
            <CourseHistorySubSection />
            <div className={classNames('divider')} />
            <CourseReviewsSubSection />
          </Scroller>
        </div>
      );
    }
    return (
      <div className={classNames('section-content', 'section-content--flex', 'section-content--course-detail')}>
        <div className={classNames('otlplus-placeholder')}>
          <div>
            OTL PLUS
          </div>
          <div>
            <Link to="/credits/">{t('ui.menu.credit')}</Link>
            &nbsp;|&nbsp;
            <Link to="/licenses/">{t('ui.menu.licences')}</Link>
          </div>
          <div>
            <a href="mailto:otlplus@sparcs.org">otlplus@sparcs.org</a>
          </div>
          <div>
            © 2017,&nbsp;
            <a href="http://sparcs.kaist.ac.kr">SPARCS</a>
            &nbsp;OTL Team
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  clicked: state.dictionary.courseActive.clicked,
  course: state.dictionary.courseActive.course,
});

const mapDispatchToProps = dispatch => ({
  clearCourseActiveDispatch: () => {
    dispatch(clearCourseActive());
  },
});

CourseDetailSection.propTypes = {
  clicked: PropTypes.bool.isRequired,
  course: CourseShape,
  clearCourseActiveDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(CourseDetailSection));

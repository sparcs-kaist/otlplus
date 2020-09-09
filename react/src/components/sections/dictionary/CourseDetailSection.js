import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import Scroller from '../../Scroller';
import RelatedSubSection from './RelatedSubSection';
import HistorySubSection from './HistorySubSection';
import ReviewsSubSection from './ReviewsSubSection';

import { clearCourseActive } from '../../../actions/dictionary/courseActive';

import courseShape from '../../../shapes/CourseShape';


class CourseDetailSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showHiddenScores: false,
    };

    // eslint-disable-next-line fp/no-mutation
    this.scoresRef = React.createRef();
    // eslint-disable-next-line fp/no-mutation
    this.scrollThresholdRef = React.createRef();
  }

  componentDidUpdate(prevProps) {
    const { currentList, clearCourseActiveDispatch } = this.props;

    if (prevProps.currentList !== currentList) {
      clearCourseActiveDispatch();
    }
  }

  onScroll() {
    if (this.scoresRef.current.getBoundingClientRect().top >= this.scrollThresholdRef.current.getBoundingClientRect().bottom) {
      this.setState({
        showHiddenScores: false,
      });
    }
    else {
      this.setState({
        showHiddenScores: true,
      });
    }
  }


  unfix = () => {
    const { clearCourseActiveDispatch } = this.props;
    clearCourseActiveDispatch();
  }


  render() {
    const { t } = this.props;
    const { showHiddenScores } = this.state;
    const { clicked, course } = this.props;

    if (clicked && course !== null) {
      return (
        <div className={classNames('section-content', 'section-content--flex', 'section-content--course-detail')}>
          <button className={classNames('close-button')} onClick={this.unfix}><i className={classNames('icon', 'icon--close-section')} /></button>
          <div className={classNames('fixed')}>
            <div>
              <div className={classNames('title')}>
                {course[t('js.property.title')]}
              </div>
              <div className={classNames('subtitle')}>
                {course.old_code}
              </div>
            </div>
            <div ref={this.scrollThresholdRef} />
            <div className={classNames('fixed__conditional-part', (showHiddenScores ? '' : 'fixed__conditional-part--hidden'))}>
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
            </div>
          </div>
          <Scroller onScroll={() => this.onScroll()} key={course.id}>
            <div>
              <div className={classNames('attribute', 'attribute--semi-long')}>
                <div>
                  {t('ui.attribute.classification')}
                </div>
                <div>
                  {`${course.department[t('js.property.name')]}, ${course[t('js.property.type')]}`}
                </div>
              </div>
              <div className={classNames('attribute', 'attribute--semi-long')}>
                <div>
                  {t('ui.attribute.description')}
                </div>
                <div>
                  {course.summary}
                </div>
              </div>
            </div>
            <div className={classNames('scores')} ref={this.scoresRef}>
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
            <RelatedSubSection />
            <div className={classNames('divider')} />
            <HistorySubSection />
            <div className={classNames('divider')} />
            <ReviewsSubSection />
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
            © 2016,&nbsp;
            <a href="http://sparcs.org">SPARCS</a>
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
  currentList: state.dictionary.list.currentList,
});

const mapDispatchToProps = dispatch => ({
  clearCourseActiveDispatch: () => {
    dispatch(clearCourseActive());
  },
});

CourseDetailSection.propTypes = {
  clicked: PropTypes.bool.isRequired,
  course: courseShape,
  currentList: PropTypes.string.isRequired,

  clearCourseActiveDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(CourseDetailSection));

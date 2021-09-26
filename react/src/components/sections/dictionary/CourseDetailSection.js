import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import { getAverageScoreLabel } from '../../../utils/scoreUtils';

import Scroller from '../../Scroller';
import CloseButton from '../../CloseButton';
import Divider from '../../Divider';
import RelatedSubSection from './RelatedSubSection';
import HistorySubSection from './HistorySubSection';
import ReviewsSubSection from './ReviewsSubSection';

import { clearCourseFocus, setLectures, setReviews } from '../../../actions/dictionary/courseFocus';
import { addCourseRead } from '../../../actions/dictionary/list';

import courseFocusShape from '../../../shapes/CourseFocusShape';
import userShape from '../../../shapes/UserShape';


class CourseDetailSection extends Component {
  constructor(props) {
    super(props);

    // eslint-disable-next-line fp/no-mutation
    this.scoresRef = React.createRef();
    // eslint-disable-next-line fp/no-mutation
    this.scrollThresholdRef = React.createRef();
  }

  componentDidUpdate(prevProps) {
    const {
      selectedListCode, courseFocus,
      clearCourseFocusDispatch, setLecturesDispatch,
    } = this.props;

    if (prevProps.selectedListCode !== selectedListCode) {
      clearCourseFocusDispatch();
    }

    if ((courseFocus.clicked && !prevProps.courseFocus.clicked)
      || (courseFocus.clicked && (prevProps.courseFocus.course !== courseFocus.course))
    ) {
      setLecturesDispatch(null);
      this._fetchLectures();
      this._fetchReviews();
    }
  }


  _fetchLectures = () => {
    const { courseFocus, setLecturesDispatch } = this.props;

    axios.get(
      `/api/courses/${courseFocus.course.id}/lectures`,
      {
        params: {
          order: ['year', 'semester', 'class_no'],
        },
        metadata: {
          gaCategory: 'Course',
          gaVariable: 'GET Lectures / Instance',
        },
      },
    )
      .then((response) => {
        const newProps = this.props;
        if (newProps.courseFocus.course.id !== courseFocus.course.id) {
          return;
        }
        setLecturesDispatch(response.data);
      })
      .catch((error) => {
      });
  }


  _fetchReviews = () => {
    const LIMIT = 100;

    const { courseFocus, setReviewsDispatch } = this.props;

    axios.get(
      `/api/courses/${courseFocus.course.id}/reviews`,
      {
        params: {
          order: ['-lecture__year', '-lecture__semester', '-written_datetime', '-id'],
          limit: LIMIT,
        },
        metadata: {
          gaCategory: 'Course',
          gaVariable: 'GET Reviews / Instance',
        },
      },
    )
      .then((response) => {
        const newProps = this.props;
        if (newProps.courseFocus.course.id !== courseFocus.course.id) {
          return;
        }
        this._markRead(courseFocus.course);
        if (response.data.length === LIMIT) {
          // TODO: handle limit overflow
        }
        setReviewsDispatch(response.data);
      })
      .catch((error) => {
      });
  }


  _markRead = (course) => {
    const { user, addCourseReadDispatch } = this.props;

    if (!user) {
      addCourseReadDispatch(course);
      return;
    }

    axios.post(
      `/api/courses/${course.id}/read`,
      {
        metadata: {
          gaCategory: 'Review',
          gaVariable: 'POST Read / Instance',
        },
      },
    )
      .then((cresponse) => {
        addCourseReadDispatch(course);
      })
      .catch((error) => {
      });
  }


  unfix = () => {
    const { clearCourseFocusDispatch } = this.props;
    clearCourseFocusDispatch();
  }


  render() {
    const { t } = this.props;
    const { courseFocus } = this.props;

    if (courseFocus.clicked && courseFocus.course !== null) {
      return (
      // eslint-disable-next-line react/jsx-indent
      <div className={classNames('section', 'section--course-detail', 'section--mobile-modal', ((courseFocus.course && courseFocus.clicked) ? '' : 'mobile-hidden'))}>
        <div className={classNames('section-content', 'section-content--flex', 'section-content--course-detail')}>
          <CloseButton onClick={this.unfix} />
          <div>
            <div>
              <div className={classNames('title')}>{ courseFocus.course[t('js.property.title')] }</div>
              <div className={classNames('subtitle')}>{ courseFocus.course.old_code }</div>
            </div>
            <div ref={this.scrollThresholdRef} />
          </div>
          <Scroller key={courseFocus.course.id}>
            <div>
              <div className={classNames('attribute', 'attribute--long-info')}>
                <div>{ t('ui.attribute.classification') }</div>
                <div>{ `${courseFocus.course.department[t('js.property.name')]}, ${courseFocus.course[t('js.property.type')]}` }</div>
              </div>
              <div className={classNames('attribute', 'attribute--long-info')}>
                <div>{ t('ui.attribute.description') }</div>
                <div>{ courseFocus.course.summary }</div>
              </div>
            </div>
            <div className={classNames('scores', 'top-sticky')} ref={this.scoresRef}>
              <div>
                <div>{ getAverageScoreLabel(courseFocus.course.grade) }</div>
                <div>{ t('ui.score.grade') }</div>
              </div>
              <div>
                <div>{ getAverageScoreLabel(courseFocus.course.load) }</div>
                <div>{ t('ui.score.load') }</div>
              </div>
              <div>
                <div>{ getAverageScoreLabel(courseFocus.course.speech) }</div>
                <div>{ t('ui.score.speech') }</div>
              </div>
            </div>
            <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={true} />
            <RelatedSubSection />
            <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={true} />
            <HistorySubSection />
            <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={true} />
            <ReviewsSubSection />
          </Scroller>
        </div>
      </div>
      );
    }
    return (
    // eslint-disable-next-line react/jsx-indent
    <div className={classNames('section', 'section--course-detail', 'section--mobile-modal', ((courseFocus.course && courseFocus.clicked) ? '' : 'mobile-hidden'))}>
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
    </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  courseFocus: state.dictionary.courseFocus,
  selectedListCode: state.dictionary.list.selectedListCode,
});

const mapDispatchToProps = (dispatch) => ({
  clearCourseFocusDispatch: () => {
    dispatch(clearCourseFocus());
  },
  setLecturesDispatch: (lectures) => {
    dispatch(setLectures(lectures));
  },
  setReviewsDispatch: (reviews) => {
    dispatch(setReviews(reviews));
  },
  addCourseReadDispatch: (course) => {
    dispatch(addCourseRead(course));
  },
});

CourseDetailSection.propTypes = {
  user: userShape,
  courseFocus: courseFocusShape.isRequired,
  selectedListCode: PropTypes.string.isRequired,

  clearCourseFocusDispatch: PropTypes.func.isRequired,
  setLecturesDispatch: PropTypes.func.isRequired,
  setReviewsDispatch: PropTypes.func.isRequired,
  addCourseReadDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    CourseDetailSection
  )
);

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import Scroller from '../../../Scroller';
import CloseButton from '../../../CloseButton';
import Divider from '../../../Divider';
import CourseInfoSubSection from './CourseInfoSubSection';
import CourseRelatedCoursesSubSection from './CourseRelatedCoursesSubSection';
import CourseHistorySubSection from './CourseHistorySubSection';
import CourseReviewsSubSection from './CourseReviewsSubSection';

import { clearCourseFocus, setLectures, setReviews } from '../../../../actions/dictionary/courseFocus';
import { addCourseRead } from '../../../../actions/dictionary/list';

import courseFocusShape from '../../../../shapes/state/dictionary/CourseFocusShape';
import userShape from '../../../../shapes/model/session/UserShape';
import OtlplusPlaceholder from '../../../OtlplusPlaceholder';


class CourseDetailSection extends Component {
  constructor(props) {
    super(props);

    // eslint-disable-next-line fp/no-mutation
    this.scoresRef = React.createRef();
  }

  componentDidUpdate(prevProps) {
    const {
      selectedListCode, courseFocus,
      clearCourseFocusDispatch,
    } = this.props;

    if (prevProps.selectedListCode !== selectedListCode) {
      clearCourseFocusDispatch();
    }

    if (!prevProps.courseFocus.course && courseFocus.course) {
      this._fetchLectures();
      this._fetchReviews();
    }
    if ((prevProps.courseFocus.course && courseFocus.course)
    && (prevProps.courseFocus.course.id !== courseFocus.course.id)) {
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
      },
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

    const sectionContent = courseFocus.course
      ? (
        <>
          <CloseButton onClick={this.unfix} />
          <div className={classNames('detail-title-area')}>
            <div className={classNames('title')}>{ courseFocus.course[t('js.property.title')] }</div>
            <div className={classNames('subtitle')}>{ courseFocus.course.old_code }</div>
          </div>
          <Scroller key={courseFocus.course.id}>
            <CourseInfoSubSection />
            <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={true} />
            <CourseRelatedCoursesSubSection />
            <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={true} />
            <CourseHistorySubSection />
            <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={true} />
            <CourseReviewsSubSection />
          </Scroller>
        </>
      )
      : (
        <OtlplusPlaceholder />
      );

    return (
      <div className={classNames('section', 'section--course-detail', 'section--mobile-modal', (courseFocus.course ? null : 'mobile-hidden'))}>
        <div className={classNames('subsection', 'subsection--flex', 'subsection--course-detail')}>
          { sectionContent }
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

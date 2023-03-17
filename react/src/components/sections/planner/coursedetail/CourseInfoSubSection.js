import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';

import qs from 'qs';
import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';
import Scroller from '../../../Scroller';
import CloseButton from '../../../CloseButton';
import Divider from '../../../Divider';

import { clearCourseFocus, setLectures, setReviews } from '../../../../actions/planner/courseFocus';
import { addCourseRead } from '../../../../actions/planner/list';

import courseFocusShape from '../../../../shapes/state/CourseFocusShape';
import userShape from '../../../../shapes/model/UserShape';

import CourseSummarySubSection from './CourseSummarySubSection';
import CourseReviewsSubSection from './CourseReviewSubSection';


class CourseInfoSubSection extends Component {
  constructor(props) {
    super(props);

    // eslint-disable-next-line fp/no-mutation
    this.scoresRef = React.createRef();
  }

  componentDidMount() {
    this._fetchLectures();
    this._fetchReviews();
  } // 처음 코스 클릭시 과목 정보가 불러와지지 않는 오류를 위한 함수

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
        if (newProps.courseFocus.course.id === courseFocus.course.id) {
          setLecturesDispatch(response.data);
        }
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

    const sectionContent = (
      <>
        <CloseButton onClick={this.unfix} />
        <div className={classNames('detail-title-area')}>
          <div className={classNames('title')}>{courseFocus.course[t('js.property.title')]}</div>
          <div className={classNames('subtitle')}>{courseFocus.course.old_code}</div>
          <Link className={classNames('text-button', 'text-button--right')} to={{ pathname: '/dictionary', search: qs.stringify({ startCourseId: courseFocus.course.id }) }} target="_blank" rel="noopener noreferrer">
            {t('ui.button.dictionary')}
          </Link>
        </div>
        <Scroller key={courseFocus.course.id}>
          <CourseSummarySubSection />
          <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={true} />
          <CourseReviewsSubSection />
        </Scroller>
      </>
    );

    return (
      <div className={classNames('subsection', 'subsection--course-info-sub')}>
        <div className={classNames('subsection', 'subsection--flex')}>
          {sectionContent}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  courseFocus: state.planner.courseFocus,
  selectedListCode: state.planner.list.selectedListCode,
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

CourseInfoSubSection.propTypes = {
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
    CourseInfoSubSection
  )
);

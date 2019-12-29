import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import axios from '../../../common/presetAxios';
import { BASE_URL } from '../../../common/constants';
import { setReviews } from '../../../actions/dictionary/courseActive';
import { addCourseRead } from '../../../actions/dictionary/list';
import ReviewBlock from '../../blocks/ReviewBlock';
import ReviewWriteBlock from '../../blocks/ReviewWriteBlock';
import CourseShape from '../../../shapes/CourseShape';
import reviewShape from '../../../shapes/ReviewShape';
import userShape from '../../../shapes/UserShape';


class CourseReviewsSubSection extends Component {
  componentDidMount() {
    this._fetchReviews();
  }


  componentDidUpdate(prevProps, prevState, snapshot) {
    const { course } = this.props;

    if (prevProps.clicked && (prevProps.course.id === course.id)) {
      return;
    }

    this._fetchReviews();
  }


  _fetchReviews = () => {
    const { course, setReviewsDispatch } = this.props;

    axios.get(`${BASE_URL}/api/courses/${course.id}/comments`, {
    })
      .then((response) => {
        const newProps = this.props;
        if (newProps.course.id !== course.id) {
          return;
        }
        this._markRead(course);
        setReviewsDispatch(response.data);
      })
      .catch((response) => {
      });
  }


  _markRead = (course) => {
    const { addCourseReadDispatch } = this.props;

    axios.post(`${BASE_URL}/api/review/read`, {
      id: course.id,
    })
      .then((cresponse) => {
      })
      .catch((response) => {
      });

    addCourseReadDispatch(course);
  }


  render() {
    const { t } = this.props;
    const { user, course, reviews } = this.props;

    const takenLectureOfCourse = user
      ? user.taken_lectures.filter(l => (l.course === course.id))
      : [];

    return (
      <>
        <div className={classNames('small-title')}>{t('ui.title.reviews')}</div>
        {
          takenLectureOfCourse.map(l => (
            <ReviewWriteBlock lecture={l} key={l.id} />
          ))
        }
        {
          (reviews == null)
            ? <div className={classNames('list-placeholder')}><div>{t('ui.placeholder.loading')}</div></div>
            : (reviews.length
              ? <div>{reviews.map(r => <ReviewBlock review={r} key={r.id} />)}</div>
              : <div className={classNames('list-placeholder')}><div>{t('ui.placeholder.noResults')}</div></div>)
        }
      </>
    );
  }
}

const mapStateToProps = state => ({
  user: state.common.user.user,
  clicked: state.dictionary.courseActive.clicked,
  course: state.dictionary.courseActive.course,
  reviews: state.dictionary.courseActive.reviews,
});

const mapDispatchToProps = dispatch => ({
  setReviewsDispatch: (reviews) => {
    dispatch(setReviews(reviews));
  },
  addCourseReadDispatch: (course) => {
    dispatch(addCourseRead(course));
  },
});

CourseReviewsSubSection.propTypes = {
  user: userShape,
  clicked: PropTypes.bool.isRequired,
  course: CourseShape,
  reviews: PropTypes.arrayOf(reviewShape),
  setReviewsDispatch: PropTypes.func.isRequired,
  addCourseReadDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(CourseReviewsSubSection));

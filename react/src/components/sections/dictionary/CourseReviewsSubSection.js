import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import axios from '../../../common/presetAxios';
import { BASE_URL } from '../../../common/constants';
import { setReviews } from '../../../actions/dictionary/courseActive';
import ReviewBlock from '../../blocks/ReviewBlock';
import ReviewWriteBlock from '../../blocks/ReviewWriteBlock';
import CourseShape from '../../../shapes/CourseShape';
import reviewShape from '../../../shapes/ReviewShape';
import userShape from '../../../shapes/UserShape';


class CourseReviewsSubSection extends Component {
  componentDidUpdate(prevProps, prevState, snapshot) {
    const { course, setReviewsDispatch } = this.props;

    if (prevProps.clicked && (prevProps.course.id === course.id)) {
      return;
    }

    axios.get(`${BASE_URL}/api/courses/${course.id}/comments`, {
    })
      .then((response) => {
        const newProps = this.props;
        if (newProps.course.id !== course.id) {
          return;
        }
        setReviewsDispatch(response.data);
      })
      .catch((response) => {
      });
  }


  render() {
    const { user, course, reviews } = this.props;

    const takenLectureOfCourse = user
      ? user.taken_lectures.filter(l => (l.course === course.id))
      : [];

    return (
      <>
        <div className={classNames('small-title')}>과목 후기</div>
        {
          takenLectureOfCourse.map(l => (
            <ReviewWriteBlock lecture={l} key={l.id} />
          ))
        }
        {
          (reviews == null)
            ? <div className={classNames('list-placeholder')}><div>불러오는 중</div></div>
            : (reviews.length
              ? <div>{reviews.map(r => <ReviewBlock review={r} key={r.id} />)}</div>
              : <div className={classNames('list-placeholder')}><div>결과 없음</div></div>)
        }
      </>
    );
  }
}

const mapStateToProps = state => ({
  user: state.common.user,
  clicked: state.dictionary.courseActive.clicked,
  course: state.dictionary.courseActive.course,
  reviews: state.dictionary.courseActive.reviews,
});

const mapDispatchToProps = dispatch => ({
  setReviewsDispatch: (reviews) => {
    dispatch(setReviews(reviews));
  },
});

CourseReviewsSubSection.propTypes = {
  user: userShape,
  clicked: PropTypes.bool.isRequired,
  course: CourseShape,
  reviews: PropTypes.arrayOf(reviewShape),
  setReviewsDispatch: PropTypes.func.isRequired,
};


export default connect(mapStateToProps, mapDispatchToProps)(CourseReviewsSubSection);

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import axios from '../../../common/presetAxios';
import { BASE_URL } from '../../../common/constants';

import ReviewBlock from '../../blocks/ReviewBlock';
import ReviewWriteBlock from '../../blocks/ReviewWriteBlock';
import SearchFilter from '../../SearchFilter';

import { setReviews, updateReview } from '../../../actions/dictionary/courseActive';
import { updateUserReview } from '../../../actions/common/user';
import { addCourseRead } from '../../../actions/dictionary/list';

import courseShape from '../../../shapes/CourseShape';
import reviewShape from '../../../shapes/ReviewShape';
import userShape from '../../../shapes/UserShape';
import semesterShape from '../../../shapes/SemesterShape';

import { isReviewWritablePlainYearSemester } from '../../../common/semesterFunctions';


class ReviewsSubSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      professor: new Set(['ALL']),
    };
  }

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
      .catch((error) => {
      });
  }


  _markRead = (course) => {
    const { user, addCourseReadDispatch } = this.props;

    if (!user) {
      addCourseReadDispatch(course);
      return;
    }

    axios.post(`${BASE_URL}/api/review/read`, {
      id: course.id,
    })
      .then((cresponse) => {
        addCourseReadDispatch(course);
      })
      .catch((error) => {
      });
  }

  updateCheckedValues = filterName => (checkedValues) => {
    this.setState({
      [filterName]: checkedValues,
    });
  }

  _getProfessorFormValue = (professor) => {
    return String(professor.professor_id);
  }

  _lectureProfessorChecker = (lecture, professor) => {
    if (professor.has('ALL')) {
      return true;
    }
    return lecture.professors.some(p => professor.has(this._getProfessorFormValue(p)));
  }

  updateOnReviewSubmit = (review) => {
    const { updateUserReviewDispatch, updateReviewDispatch } = this.props;
    updateUserReviewDispatch(review);
    updateReviewDispatch(review);
  }

  render() {
    const { t } = this.props;
    const { professor } = this.state;
    const { user, semesters, course, reviews } = this.props;

    const professorOptions = [
      ['ALL', t('ui.type.allShort')],
      ...(course.professors
        .map(p => [this._getProfessorFormValue(p), p[t('js.property.name')]])
      ),
    ];

    const takenLectureOfCourse = user
      ? user.taken_lectures
        .filter(l => ((l.course === course.id) && this._lectureProfessorChecker(l, professor)))
        .filter(l => isReviewWritablePlainYearSemester(semesters, l.year, l.semester))
      : [];
    const filteredReviews = reviews == null
      ? null
      : reviews.filter(r => this._lectureProfessorChecker(r.lecture, professor));

    return (
      <>
        <div className={classNames('small-title')}>{t('ui.title.reviews')}</div>
        <SearchFilter
          updateCheckedValues={this.updateCheckedValues('professor')}
          inputName="professor"
          titleName={t('ui.search.professor')}
          options={professorOptions}
          checkedValues={this.state.professor}
        />
        {
          takenLectureOfCourse.map(l => (
            <ReviewWriteBlock lecture={l} key={l.id} review={user.reviews.find(r => (r.lecture.id === l.id))} updateOnSubmit={this.updateOnReviewSubmit} />
          ))
        }
        {
          (filteredReviews == null)
            ? <div className={classNames('section-content--course-detail__list-area', 'list-placeholder')}><div>{t('ui.placeholder.loading')}</div></div>
            : (filteredReviews.length
              ? <div className={classNames('section-content--course-detail__list-area')}>{filteredReviews.map(r => <ReviewBlock review={r} key={r.id} />)}</div>
              : <div className={classNames('section-content--course-detail__list-area', 'list-placeholder')}><div>{t('ui.placeholder.noResults')}</div></div>)
        }
      </>
    );
  }
}

const mapStateToProps = state => ({
  user: state.common.user.user,
  semesters: state.common.semester.semesters,
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
  updateUserReviewDispatch: (review) => {
    dispatch(updateUserReview(review));
  },
  updateReviewDispatch: (review) => {
    dispatch(updateReview(review));
  },
});

ReviewsSubSection.propTypes = {
  user: userShape,
  semesters: semesterShape,
  clicked: PropTypes.bool.isRequired,
  course: courseShape,
  reviews: PropTypes.arrayOf(reviewShape),
  setReviewsDispatch: PropTypes.func.isRequired,
  addCourseReadDispatch: PropTypes.func.isRequired,
  updateUserReviewDispatch: PropTypes.func.isRequired,
  updateReviewDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(ReviewsSubSection));

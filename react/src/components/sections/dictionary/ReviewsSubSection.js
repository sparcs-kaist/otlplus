import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import ReviewBlock from '../../blocks/ReviewBlock';
import ReviewWriteBlock from '../../blocks/ReviewWriteBlock';
import SearchFilter from '../../SearchFilter';

import { setReviews, updateReview } from '../../../actions/dictionary/courseFocus';
import { updateUserReview } from '../../../actions/common/user';
import { addCourseRead } from '../../../actions/dictionary/list';

import courseFocusShape from '../../../shapes/CourseFocusShape';
import userShape from '../../../shapes/UserShape';


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
    const { courseFocus } = this.props;

    if (
      courseFocus.clicked
      && courseFocus.course
      && (!prevProps.courseFocus.clicked || !prevProps.courseFocus.course || (prevProps.courseFocus.course.id !== courseFocus.course.id))) {
      this._fetchReviews();
    }
  }


  _fetchReviews = () => {
    const { courseFocus, setReviewsDispatch } = this.props;

    axios.get(
      `/api/courses/${courseFocus.course.id}/reviews`,
      {
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

  updateCheckedValues = filterName => (checkedValues) => {
    this.setState({
      [filterName]: checkedValues,
    });

    ReactGA.event({
      category: 'Dictionary - Review',
      action: 'Filtered Review',
    });
  }

  // eslint-disable-next-line arrow-body-style
  _getProfessorFormValue = (professor) => {
    return String(professor.professor_id);
  }

  _lectureProfessorChecker = (lecture, professor) => {
    if (professor.has('ALL')) {
      return true;
    }
    return lecture.professors.some(p => professor.has(this._getProfessorFormValue(p)));
  }

  updateOnReviewSubmit = (review, isNew) => {
    const { updateUserReviewDispatch, updateReviewDispatch } = this.props;
    updateUserReviewDispatch(review);
    updateReviewDispatch(review, isNew);
  }

  render() {
    const { t } = this.props;
    const { professor } = this.state;
    const { user, courseFocus } = this.props;

    if (!courseFocus.course) {
      return null;
    }

    const professorOptions = [
      ['ALL', t('ui.type.allShort')],
      ...(courseFocus.course.professors
        .map(p => [this._getProfessorFormValue(p), p[t('js.property.name')]])
      ),
    ];

    const takenLecturesOfCourse = user
      ? user.review_writable_lectures
        .filter(l => ((l.course === courseFocus.course.id) && this._lectureProfessorChecker(l, professor)))
      : [];
    const reviewWriteBlocks = takenLecturesOfCourse.map(l => (
      <ReviewWriteBlock
        lecture={l}
        key={l.id}
        review={user.reviews.find(r => (r.lecture.id === l.id))}
        pageFrom="Dictionary"
        updateOnSubmit={this.updateOnReviewSubmit}
      />
    ));

    const filteredReviews = courseFocus.reviews == null
      ? null
      : courseFocus.reviews.filter(r => this._lectureProfessorChecker(r.lecture, professor));
    const reviewBlocksArea = (filteredReviews == null)
      ? <div className={classNames('section-content--course-detail__list-area', 'list-placeholder')}><div>{t('ui.placeholder.loading')}</div></div>
      : (filteredReviews.length
        ? <div className={classNames('section-content--course-detail__list-area')}>{filteredReviews.map(r => <ReviewBlock review={r} pageFrom="Dictionary" key={r.id} />)}</div>
        : <div className={classNames('section-content--course-detail__list-area', 'list-placeholder')}><div>{t('ui.placeholder.noResults')}</div></div>);

    return (
      <>
        <div className={classNames('small-title')}>{t('ui.title.reviews')}</div>
        <SearchFilter
          updateCheckedValues={this.updateCheckedValues('professor')}
          inputName="professor"
          titleName={t('ui.search.professor')}
          options={professorOptions}
          checkedValues={professor}
        />
        { reviewWriteBlocks }
        { reviewBlocksArea }
      </>
    );
  }
}

const mapStateToProps = state => ({
  user: state.common.user.user,
  courseFocus: state.dictionary.courseFocus,
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
  updateReviewDispatch: (review, isNew) => {
    dispatch(updateReview(review, isNew));
  },
});

ReviewsSubSection.propTypes = {
  user: userShape,
  courseFocus: courseFocusShape.isRequired,

  setReviewsDispatch: PropTypes.func.isRequired,
  addCourseReadDispatch: PropTypes.func.isRequired,
  updateUserReviewDispatch: PropTypes.func.isRequired,
  updateReviewDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(ReviewsSubSection));

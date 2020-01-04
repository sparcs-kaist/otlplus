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
import SearchFilter from '../../SearchFilter';


class CourseReviewsSubSection extends Component {
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
    const { addCourseReadDispatch } = this.props;

    axios.post(`${BASE_URL}/api/review/read`, {
      id: course.id,
    })
      .then((cresponse) => {
      })
      .catch((error) => {
      });

    addCourseReadDispatch(course);
  }

  clickCircle = (filter_) => {
    const filterName = filter_.name;
    const { value, isChecked } = filter_;

    if (isChecked) {
      this.setState((prevState) => {
        const filter = prevState[filterName];
        if (value === 'ALL') {
          filter.clear();
        }
        filter.add(value);
        return prevState;
      });
    }
    else {
      this.setState((prevState) => {
        const filter = prevState[filterName];
        filter.delete(value);
        return prevState;
      });
    }
  }

  _lectureProfessorChecker = (lecture, professor) => {
    if (professor.has('ALL')) {
      return true;
    }
    return lecture.professors.some(p => professor.has(String(p.professor_id)));
  }

  render() {
    const { t } = this.props;
    const { professor } = this.state;
    const { user, course, reviews } = this.props;

    const professorOptions = [
      ['ALL', t('ui.type.allShort')],
      ...(course.professors
        .map(p => [String(p.professor_id), p[t('js.property.name')]])
      ),
    ];

    const takenLectureOfCourse = user
      ? user.taken_lectures.filter(l => ((l.course === course.id) && this._lectureProfessorChecker(l, professor)))
      : [];
    const filteredReviews = reviews == null
      ? null
      : reviews.filter(r => this._lectureProfessorChecker(r.lecture, professor));

    return (
      <>
        <div className={classNames('small-title')}>{t('ui.title.reviews')}</div>
        <SearchFilter
          clickCircle={this.clickCircle}
          inputName="professor"
          titleName={t('ui.search.professor')}
          options={professorOptions}
        />
        {
          takenLectureOfCourse.map(l => (
            <ReviewWriteBlock lecture={l} key={l.id} />
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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import ReviewBlock from '../../blocks/ReviewBlock';
import ReviewWriteBlock from '../../blocks/ReviewWriteBlock';
import SearchFilter from '../../SearchFilter';

import { updateReview } from '../../../actions/dictionary/courseFocus';
import { updateUserReview } from '../../../actions/common/user';

import courseFocusShape from '../../../shapes/CourseFocusShape';
import userShape from '../../../shapes/UserShape';


class ReviewsSubSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedProfessors: new Set(['ALL']),
    };
  }

  updateCheckedValues = (filterName) => (checkedValues) => {
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
    return lecture.professors.some((p) => professor.has(this._getProfessorFormValue(p)));
  }

  updateOnReviewSubmit = (review, isNew) => {
    const { updateUserReviewDispatch, updateReviewDispatch } = this.props;
    updateUserReviewDispatch(review);
    updateReviewDispatch(review, isNew);
  }

  render() {
    const { t } = this.props;
    const { selectedProfessors } = this.state;
    const { user, courseFocus } = this.props;

    if (!courseFocus.course) {
      return null;
    }

    const professorOptions = [
      ['ALL', t('ui.type.allShort')],
      ...(courseFocus.course.professors
        .map((p) => [this._getProfessorFormValue(p), p[t('js.property.name')]])
      ),
    ];

    const takenLecturesOfCourse = user
      ? user.review_writable_lectures
        .filter((l) => ((l.course === courseFocus.course.id) && this._lectureProfessorChecker(l, selectedProfessors)))
      : [];
    const reviewWriteBlocks = takenLecturesOfCourse.map((l) => (
      <ReviewWriteBlock
        lecture={l}
        key={l.id}
        review={user.reviews.find((r) => (r.lecture.id === l.id))}
        pageFrom="Dictionary"
        updateOnSubmit={this.updateOnReviewSubmit}
      />
    ));

    const filteredReviews = courseFocus.reviews == null
      ? null
      : courseFocus.reviews.filter((r) => this._lectureProfessorChecker(r.lecture, selectedProfessors));
    const reviewBlocksArea = (filteredReviews == null)
      ? <div className={classNames('section-content--course-detail__list-area', 'list-placeholder')}><div>{t('ui.placeholder.loading')}</div></div>
      : (filteredReviews.length
        ? <div className={classNames('section-content--course-detail__list-area')}>{filteredReviews.map((r) => <ReviewBlock review={r} shouldLimitLines={false} pageFrom="Dictionary" key={r.id} />)}</div>
        : <div className={classNames('section-content--course-detail__list-area', 'list-placeholder')}><div>{t('ui.placeholder.noResults')}</div></div>);

    return (
      <>
        <div className={classNames('small-title')}>{t('ui.title.reviews')}</div>
        <SearchFilter
          updateCheckedValues={this.updateCheckedValues('selectedProfessors')}
          inputName="professor"
          titleName={t('ui.search.professor')}
          options={professorOptions}
          checkedValues={selectedProfessors}
        />
        { reviewWriteBlocks }
        { reviewBlocksArea }
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  courseFocus: state.dictionary.courseFocus,
});

const mapDispatchToProps = (dispatch) => ({
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

  updateUserReviewDispatch: PropTypes.func.isRequired,
  updateReviewDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(ReviewsSubSection));

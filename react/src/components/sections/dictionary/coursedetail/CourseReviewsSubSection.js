import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import ReviewBlock from '../../../blocks/ReviewBlock';
import ReviewWriteBlock from '../../../blocks/ReviewWriteBlock';
import SearchFilter from '../../../SearchFilter';

import { updateReview } from '../../../../actions/dictionary/courseFocus';
import { updateUserReview } from '../../../../actions/common/user';

import courseFocusShape from '../../../../shapes/state/dictionary/CourseFocusShape';
import userShape from '../../../../shapes/model/session/UserShape';
import { calcAverage, getAverageScoreLabel } from '../../../../utils/scoreUtils';
import Scores from '../../../Scores';


class CourseReviewsSubSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedProfessors: new Set(['ALL']),
      selectedLanguages: new Set(['ALL']),
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

  _getProfessorFormValue = (professor) => {
    return String(professor.professor_id);
  }

  _checkLectureProfessor = (lecture) => {
    const { selectedProfessors } = this.state;
    if (selectedProfessors.has('ALL')) {
      return true;
    }
    return lecture.professors.some((p) => selectedProfessors.has(this._getProfessorFormValue(p)));
  }

  _checkLectureCourse = (lecture) => {
    const { courseFocus } = this.props;
    return lecture.course === courseFocus.course.id;
  }

  _checkReviewLanguage = (review) => {
    const { selectedLanguages } = this.state;
    if (selectedLanguages.has('ALL')) {
      return true;
    }
    if (selectedLanguages.has('ENG')) {
      const engAndKorLength = (review.content.match(/[A-Za-z가-힣]/g) || []).length;
      const engLength = (review.content.match(/[A-Za-z]/g) || []).length;
      return (engAndKorLength === 0) || (engLength / engAndKorLength > 0.55);
    }
    return false;
  }

  updateOnReviewSubmit = (review, isNew) => {
    const { updateUserReviewDispatch, updateReviewDispatch } = this.props;
    updateUserReviewDispatch(review);
    updateReviewDispatch(review, isNew);
  }

  render() {
    const { t } = this.props;
    const { selectedProfessors, selectedLanguages } = this.state;
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
    const languageOptions = [
      ['ALL', t('ui.language.allShort')],
      ['ENG', t('ui.language.englishShort')],
    ];

    const takenLecturesOfCourse = user
      ? user.review_writable_lectures.filter((l) => (
        this._checkLectureCourse(l) && this._checkLectureProfessor(l)
      ))
      : [];
    const reviewWriteBlocksArea = (
      takenLecturesOfCourse.length === 0
        ? undefined
        : (
          <div className={classNames('block-list')}>
            {
              takenLecturesOfCourse.map((l) => (
                <ReviewWriteBlock
                  lecture={l}
                  key={l.id}
                  review={user.reviews.find((r) => (r.lecture.id === l.id))}
                  pageFrom="Dictionary"
                  updateOnSubmit={this.updateOnReviewSubmit}
                />
              ))
            }
          </div>
        )
    );

    const filteredReviews = courseFocus.reviews == null
      ? null
      : courseFocus.reviews.filter((r) => (
        this._checkLectureProfessor(r.lecture) && this._checkReviewLanguage(r)
      ));
    const reviewBlocksArea = (filteredReviews == null)
      ? (
        <div className={classNames('list-placeholder', 'min-height-area')}>
          <div>{t('ui.placeholder.loading')}</div>
        </div>
      )
      : (filteredReviews.length
        ? (
          <div className={classNames('block-list', 'min-height-area')}>
            {filteredReviews.map((r) => <ReviewBlock review={r} shouldLimitLines={false} pageFrom="Dictionary" key={r.id} />)}
          </div>
        )
        : (
          <div className={classNames('list-placeholder', 'min-height-area')}>
            <div>{t('ui.placeholder.noResults')}</div>
          </div>
        )
      );

    const [, , , [grade, load, speech]] = (
      filteredReviews
        ? calcAverage(filteredReviews)
        : [0, 0, [0, 0, 0], [0, 0, 0]]
    );

    return (
      <div className={classNames('subsection', 'subsection--course-reviews')}>
        <div className={classNames('small-title')}>{t('ui.title.reviews')}</div>
        <SearchFilter
          updateCheckedValues={this.updateCheckedValues('selectedProfessors')}
          inputName="professor"
          titleName={t('ui.search.professor')}
          options={professorOptions}
          checkedValues={selectedProfessors}
        />
        <SearchFilter
          updateCheckedValues={this.updateCheckedValues('selectedLanguages')}
          inputName="language"
          titleName={t('ui.search.language')}
          options={languageOptions}
          checkedValues={selectedLanguages}
        />
        <Scores
          entries={[
            { name: t('ui.score.grade'), score: getAverageScoreLabel(grade) },
            { name: t('ui.score.load'), score: getAverageScoreLabel(load) },
            { name: t('ui.score.speech'), score: getAverageScoreLabel(speech) },
          ]}
          big
        />
        { reviewWriteBlocksArea }
        { reviewBlocksArea }
      </div>
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

CourseReviewsSubSection.propTypes = {
  user: userShape,
  courseFocus: courseFocusShape.isRequired,

  updateUserReviewDispatch: PropTypes.func.isRequired,
  updateReviewDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    CourseReviewsSubSection
  )
);

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import ReviewBlock from '../../../blocks/ReviewBlock';
import SearchFilter from '../../../SearchFilter';

import itemFocusShape from '../../../../shapes/state/ItemFocusShape';
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
    const { itemFocus } = this.props;
    return lecture.course === itemFocus.course.id;
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

  render() {
    const { t } = this.props;
    const { selectedProfessors, selectedLanguages } = this.state;
    const { itemFocus } = this.props;

    if (!itemFocus.course) {
      return null;
    }

    const professorOptions = [
      ['ALL', t('ui.type.allShort')],
      ...(itemFocus.course.professors
        .map((p) => [this._getProfessorFormValue(p), p[t('js.property.name')]])
      ),
    ];
    const languageOptions = [
      ['ALL', t('ui.language.allShort')],
      ['ENG', t('ui.language.englishShort')],
    ];

    const filteredReviews = itemFocus.reviews == null
      ? null
      : itemFocus.reviews.filter((r) => (
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
        {reviewBlocksArea}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  itemFocus: state.planner.itemFocus,
});

const mapDispatchToProps = (dispatch) => ({
});

CourseReviewsSubSection.propTypes = {
  itemFocus: itemFocusShape.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    CourseReviewsSubSection
  )
);

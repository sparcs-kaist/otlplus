import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import qs from 'qs';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import Scroller from '../../../Scroller';
import CloseButton from '../../../CloseButton';
import ReviewBlock from '../../../blocks/ReviewBlock';
import SemesterBlock from '../../../blocks/SemesterBlock';

import { clearReviewsFocus } from '../../../../actions/write-reviews/reviewsFocus';
import { addSemesterReviews, setSemesterReviewCount } from '../../../../actions/write-reviews/rankedReviews';

import reviewsFocusShape from '../../../../shapes/state/write-reviews/ReviewsFocusShape';
import { getSemesterName } from '../../../../utils/semesterUtils';
import semesterShape from '../../../../shapes/model/subject/SemesterShape';
import reviewShape from '../../../../shapes/model/review/ReviewShape';
import Scores from '../../../Scores';


export const ALL = 'ALL';


class RankedReviewsSubSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedSemester: ALL,
      loadingSemesters: [],
    };

    // eslint-disable-next-line fp/no-mutation
    this.blockListRef = React.createRef();
  }


  componentDidMount() {
    const { selectedSemester } = this.state;
    const { semesters } = this.props;

    if (semesters) {
      this._setStartSemester();
    }

    if (this._getReviewCountOfSemester(selectedSemester) === undefined) {
      this._fetchReviewsCount();
    }
    if (this._getReviewsOfSemester(selectedSemester) === null) {
      this._fetchRankedReviews();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { semesters } = this.props;
    const { selectedSemester } = this.state;

    if (!prevProps.semesters && semesters) {
      this._setStartSemester();
    }

    if (selectedSemester !== prevState.selectedSemester) {
      if (this._getReviewCountOfSemester(selectedSemester) === undefined) {
        this._fetchReviewsCount();
      }
      if (this._getReviewsOfSemester(selectedSemester) === null) {
        this._fetchRankedReviews();
      }
    }
  }

  _getTargetSemesters = () => {
    const { semesters } = this.props;

    const now = new Date();
    return semesters.filter((s) => (
      s.year >= 2013
        && (now - new Date(s.gradePosting)) > 30 * 24 * 60 * 60 * 1000
    ));
  }

  _getSemesterKey = (semester) => {
    if (semester === ALL) {
      return 'ALL';
    }
    return `${semester.year}-${semester.semester}`;
  }

  _setStartSemester = () => {
    const targetSemesters = this._getTargetSemesters();
    this.setState({
      selectedSemester: targetSemesters[targetSemesters.length - 1],
    });
  }

  _fetchReviewsCount = () => {
    const { selectedSemester } = this.state;
    const { setSemesterReviewCountDispatch } = this.props;

    const options = (selectedSemester === ALL)
      ? {
      }
      : {
        lecture_year: selectedSemester.year,
        lecture_semester: selectedSemester.semester,
      };

    axios.get(
      '/api/reviews',
      {
        params: {
          ...options,
          response_type: 'count',
        },
        metadata: {
          gaCategory: 'Review',
          gaVariable: 'GET / List Count',
        },
      },
    )
      .then((response) => {
        setSemesterReviewCountDispatch(this._getSemesterKey(selectedSemester), response.data);
      })
      .catch((error) => {
      });
  }

  _fetchRankedReviews = () => {
    // const { addReviewsDispatch } = this.props;
    const { loadingSemesters, selectedSemester } = this.state;
    const { addSemesterReviewsDispatch } = this.props;

    const PAGE_SIZE = 10;

    if (loadingSemesters.includes(this._getSemesterKey(selectedSemester))) {
      return;
    }

    const offset = (this._getReviewsOfSemester(selectedSemester) || []).length;
    const options = (selectedSemester === ALL)
      ? {
      }
      : {
        lecture_year: selectedSemester.year,
        lecture_semester: selectedSemester.semester,
      };

    this.setState({
      loadingSemesters: loadingSemesters.concat([this._getSemesterKey(selectedSemester)]),
    });
    axios.get(
      '/api/reviews',
      {
        params: {
          ...options,
          order: ['-like'],
          offset: offset,
          limit: PAGE_SIZE,
        },
        metadata: {
          gaCategory: 'Review',
          gaVariable: 'GET Latest / List',
        },
      },
    )
      .then((response) => {
        this.setState((prevState) => ({
          loadingSemesters: (
            prevState.loadingSemesters.filter((s) => (s !== this._getSemesterKey(selectedSemester)))
          ),
        }));
        addSemesterReviewsDispatch(this._getSemesterKey(selectedSemester), response.data);
      })
      .catch((error) => {
      });

    if (offset !== 0) {
      ReactGA.event({
        category: 'Write Reviews - Ranked Review',
        action: 'Loaded More Review',
        label: `Semester : ${selectedSemester.year}-${selectedSemester.semester} / Review Order : ${offset}-${offset + PAGE_SIZE - 1}`,
      });
    }
  }


  _getReviewCountOfSemester = (semester) => {
    const { reviewCountBySemester } = this.props;
    return reviewCountBySemester[this._getSemesterKey(semester)];
  }


  _getReviewsOfSemester = (semester) => {
    const { reviewsBySemester } = this.props;
    return reviewsBySemester[this._getSemesterKey(semester)] || null;
  }


  handleScroll = () => {
    const SCROLL_THRSHOLD = 100;

    if (!this.blockListRef.current) {
      return;
    }

    const blockListElement = this.blockListRef.current;
    const scrollElement = blockListElement.closest('.ScrollbarsCustom-Scroller');

    const bottomOffset = (
      blockListElement.getBoundingClientRect().bottom - scrollElement.getBoundingClientRect().bottom
    );
    if (bottomOffset < SCROLL_THRSHOLD) {
      this._fetchRankedReviews();
    }
  }


  unfix = () => {
    const { clearReviewsFocusDispatch } = this.props;

    clearReviewsFocusDispatch();
  }


  selectSemester = (semester) => {
    this.setState({ selectedSemester: semester });
  }


  render() {
    const { t } = this.props;
    const { selectedSemester } = this.state;
    const { reviewsFocus, semesters } = this.props;

    const semesterBlocks = (semesters === null)
      ? (
        null
      )
      : [
        <SemesterBlock
          semester={ALL}
          isRaised={selectedSemester === ALL}
          onClick={this.selectSemester}
          key={ALL}
        />,
        this._getTargetSemesters()
          .map((s) => (
            <SemesterBlock
              semester={s}
              isRaised={selectedSemester === s}
              onClick={this.selectSemester}
              key={`${s.year}-${s.semester}`}
            />
          )),
      ];

    const subtitle = (selectedSemester === ALL)
      ? t('ui.semester.all')
      : `${selectedSemester.year} ${getSemesterName(selectedSemester.semester)}`;

    const reviews = this._getReviewsOfSemester(selectedSemester);
    const reviewBlocksArea = (
      reviews == null
        ? (
          <div className={classNames('list-placeholder', 'min-height-area')}>
            <div>{t('ui.placeholder.loading')}</div>
          </div>
        )
        : (
          reviews.length
            ? (
              <div className={classNames('block-list', 'min-height-area')} ref={this.blockListRef}>
                {
                  reviews.map((r) => (
                    <ReviewBlock
                      review={r}
                      shouldLimitLines={false}
                      linkTo={{ pathname: '/dictionary', search: qs.stringify({ startCourseId: r.course.id }) }}
                      pageFrom="Write Reviews"
                      key={r.id}
                    />
                  ))
                }
              </div>
            )
            : (
              <div className={classNames('list-placeholder', 'min-height-area')}>
                <div>{t('ui.placeholder.noResults')}</div>
              </div>
            )
        )
    );

    return (
      <div className={classNames('subsection', 'subsection--flex', 'subsection--various-reviews')}>
        <CloseButton onClick={this.unfix} />
        <div className={classNames('block-grid')}>
          { semesterBlocks }
        </div>
        <Scroller
          key={`${reviewsFocus.from}-${this._getSemesterKey(selectedSemester)}`}
          onScroll={this.handleScroll}
        >
          <div className={classNames('title')}>{`${t('ui.title.rankedReviews')} - ${subtitle}`}</div>
          <Scores
            entries={[
              {
                name: t('ui.score.totalReviews'),
                score: (
                  this._getReviewCountOfSemester(selectedSemester) !== undefined
                    ? this._getReviewCountOfSemester(selectedSemester)
                    : '-'
                ),
              },
            ]}
          />
          { reviewBlocksArea }
        </Scroller>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  semesters: state.common.semester.semesters,
  reviewsFocus: state.writeReviews.reviewsFocus,
  reviewsBySemester: state.writeReviews.rankedReviews.reviewsBySemester,
  reviewCountBySemester: state.writeReviews.rankedReviews.reviewCountBySemester,
});

const mapDispatchToProps = (dispatch) => ({
  clearReviewsFocusDispatch: () => {
    dispatch(clearReviewsFocus());
  },
  addSemesterReviewsDispatch: (semester, reviews) => {
    dispatch(addSemesterReviews(semester, reviews));
  },
  setSemesterReviewCountDispatch: (semester, count) => {
    dispatch(setSemesterReviewCount(semester, count));
  },
});

RankedReviewsSubSection.propTypes = {
  semesters: PropTypes.arrayOf(semesterShape),
  reviewsFocus: reviewsFocusShape.isRequired,
  reviewsBySemester: PropTypes.objectOf(PropTypes.arrayOf(reviewShape)).isRequired,
  reviewCountBySemester: PropTypes.objectOf(PropTypes.number).isRequired,

  clearReviewsFocusDispatch: PropTypes.func.isRequired,
  addSemesterReviewsDispatch: PropTypes.func.isRequired,
  setSemesterReviewCountDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    RankedReviewsSubSection
  )
);

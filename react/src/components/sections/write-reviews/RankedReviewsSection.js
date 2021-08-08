import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import qs from 'qs';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import Scroller from '../../Scroller';
import ReviewBlock from '../../blocks/ReviewBlock';
import SemesterBlock from '../../blocks/SemesterBlock';

import { clearReviewsFocus } from '../../../actions/write-reviews/reviewsFocus';
import { addSemesterReviews, setSemesterReviewCount } from '../../../actions/write-reviews/rankedReviews';

import reviewsFocusShape from '../../../shapes/ReviewsFocusShape';
import { getSemesterName } from '../../../common/semesterFunctions';
import semesterShape from '../../../shapes/SemesterShape';


export const ALL = 'ALL';


class RankedReviewsSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedSemester: ALL,
      loadingSemesters: [],
    };

    // eslint-disable-next-line fp/no-mutation
    this.rightSectionRef = React.createRef();
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

  _getSemesterKey = (semester) => {
    if (semester === ALL) {
      return 'ALL';
    }
    return `${semester.year}-${semester.semester}`;
  }

  _setStartSemester = () => {
    const { semesters } = this.props;

    const today = new Date();
    const yearSemester = (today.getMonth() < 6)
      ? [today.getFullYear() - 1, 3]
      : [today.getFullYear(), 1];

    const targetSemester = semesters
      .find((s) => ((s.year === yearSemester[0]) && (s.semester === yearSemester[1])));

    if (targetSemester) {
      this.setState({
        selectedSemester: targetSemester,
      });
    }
    else {
      this.setState({
        selectedSemester: semesters[semesters.length - 1],
      });
    }
  }

  _fetchReviewsCount = () => {
    const { selectedSemester } = this.state;
    const { setSemesterReviewCountDispatch } = this.props;

    const params = (selectedSemester === ALL)
      ? {
        response_type: 'count',
      }
      : {
        response_type: 'count',
        lecture_year: selectedSemester.year,
        lecture_semester: selectedSemester.semester,
      };

    axios.get(
      '/api/reviews',
      {
        params: params,
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
    const params = (selectedSemester === ALL)
      ? {
        order: ['-like'],
        offset: offset,
        limit: PAGE_SIZE,
      }
      : {
        order: ['-like'],
        offset: offset,
        limit: PAGE_SIZE,
        lecture_year: selectedSemester.year,
        lecture_semester: selectedSemester.semester,
      };

    this.setState({
      loadingSemesters: loadingSemesters.concat([this._getSemesterKey(selectedSemester)]),
    });
    axios.get(
      '/api/reviews',
      {
        params: params,
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

    const refElement = this.rightSectionRef.current;
    const sectionPos = refElement.getBoundingClientRect().bottom;
    const scrollPos = refElement.querySelector(`.${classNames('section-content--latest-reviews__list-area')}`).getBoundingClientRect().bottom;
    if (scrollPos - sectionPos < SCROLL_THRSHOLD) {
      this._fetchRankedReviews();
    }
  }


  unfix = () => {
    const { clearReviewsFocusDispatch } = this.props;

    clearReviewsFocusDispatch();
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
          onClick={() => {
            this.setState({ selectedSemester: ALL });
          }}
          key={ALL}
        />,
        ...semesters
          .filter((s) => (s.year >= 2013))
          .map((s) => (
            <SemesterBlock
              semester={s}
              isRaised={selectedSemester === s}
              onClick={() => {
                this.setState({ selectedSemester: s });
              }}
              key={`${s.year}-${s.semester}`}
            />
          )),
        ...semesters.map((s) => (
          <div key={`dummy-${s.year}-${s.semester}`} className={classNames('section-content--latest-reviews__blocks__dummy')} />
        )),
      ];

    const subtitle = (selectedSemester === ALL)
      ? t('ui.semester.all')
      : `${selectedSemester.year} ${getSemesterName(selectedSemester.semester)}`;

    const reviews = this._getReviewsOfSemester(selectedSemester);
    const reviewBlocksArea = (reviews == null)
      ? <div className={classNames('section-content--latest-reviews__list-area', 'list-placeholder')}><div>{t('ui.placeholder.loading')}</div></div>
      : (reviews.length
        ? <div className={classNames('section-content--latest-reviews__list-area')}>{reviews.map((r) => <ReviewBlock review={r} shouldLimitLines={false} linkTo={{ pathname: '/dictionary', search: qs.stringify({ startCourseId: r.course.id }) }} pageFrom="Write Reviews" key={r.id} />)}</div>
        : <div className={classNames('section-content--latest-reviews__list-area', 'list-placeholder')}><div>{t('ui.placeholder.noResults')}</div></div>);

    return (
      <div className={classNames('section-content', 'section-content--flex', 'section-content--write-reviews-right')} ref={this.rightSectionRef}>
        <div className={classNames('close-button-wrap')}>
          <button onClick={this.unfix}>
            <i className={classNames('icon', 'icon--close-section')} />
          </button>
        </div>
        <div className={classNames('section-content--latest-reviews__blocks')}>
          { semesterBlocks }
        </div>
        <Scroller
          key={`${reviewsFocus.from}-${this._getSemesterKey(selectedSemester)}`}
          onScroll={this.handleScroll}
        >
          <div className={classNames('section-content', 'section-content--latest-reviews')}>
            <div className={classNames('title')}>{`${t('ui.title.rankedReviews')} - ${subtitle}`}</div>
            <div className={classNames('scores')}>
              <div>
                <div>
                  {
                    this._getReviewCountOfSemester(selectedSemester) !== undefined
                      ? this._getReviewCountOfSemester(selectedSemester)
                      : '-'
                  }
                </div>
                <div>{t('ui.score.totalReviews')}</div>
              </div>
            </div>
            { reviewBlocksArea }
          </div>
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

RankedReviewsSection.propTypes = {
  semesters: PropTypes.arrayOf(semesterShape),
  reviewsFocus: reviewsFocusShape.isRequired,
  reviewsBySemester: PropTypes.object.isRequired,
  reviewCountBySemester: PropTypes.object.isRequired,

  clearReviewsFocusDispatch: PropTypes.func.isRequired,
  addSemesterReviewsDispatch: PropTypes.func.isRequired,
  setSemesterReviewCountDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(RankedReviewsSection));

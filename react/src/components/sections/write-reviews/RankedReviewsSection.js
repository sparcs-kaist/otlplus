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

import reviewShape from '../../../shapes/ReviewShape';
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
      _tempCount: 0,
      _tempReviews: null,
    };

    // eslint-disable-next-line fp/no-mutation
    this.rightSectionRef = React.createRef();
  }


  componentDidMount() {
    const { semesters } = this.props;

    if (semesters) {
      this._setStartSemester();
    }

    this._fetchReviewsCount();
    this._fetchRankedReviews();
  }

  componentDidUpdate(prevProps, prevState) {
    const { semesters } = this.props;
    const { selectedSemester } = this.state;

    if (!prevProps.semesters && semesters) {
      this._setStartSemester();
    }

    if (selectedSemester !== prevState.selectedSemester) {
      this._fetchReviewsCount();
      this._fetchRankedReviews();
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

    this.setState({
      selectedSemester: semesters[semesters.length - 1],
    });
  }

  _fetchReviewsCount = () => {
    const { selectedSemester } = this.state;

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
        const newState = this.state;
        if (newState.selectedSemester !== selectedSemester) {
          return;
        }
        this.setState((prevState) => ({
          _tempCount: response.data,
        }));
      })
      .catch((error) => {
      });
  }

  _fetchRankedReviews = () => {
    // const { addReviewsDispatch } = this.props;
    const { loadingSemesters, selectedSemester } = this.state;
    const { _tempReviews } = this.state;

    const PAGE_SIZE = 10;

    if (loadingSemesters.includes(this._getSemesterKey(selectedSemester))) {
      return;
    }

    const params = (selectedSemester === ALL)
      ? {
        order: ['-like'],
        offset: (_tempReviews || []).length,
        limit: PAGE_SIZE,
      }
      : {
        order: ['-like'],
        offset: (_tempReviews || []).length,
        limit: PAGE_SIZE,
        lecture_year: selectedSemester.year,
        lecture_semester: selectedSemester.semester,
      };

    this.setState({
      loadingSemesters: loadingSemesters.concat([selectedSemester]),
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
          loadingSemesters: prevState.loadingSemesters.filter((s) => (s !== this._getSemesterKey(selectedSemester))),
        }));
        const newState = this.state;
        if (newState.selectedSemester !== selectedSemester) {
          return;
        }
        this.setState((prevState) => ({
          _tempReviews: response.data,
        }));
        // addReviewsDispatch(response.data);
      })
      .catch((error) => {
      });

    /*
    if (pageNumToLoad !== 0) {
      ReactGA.event({
        category: 'Write Reviews - Latest Review',
        action: 'Loaded More Review',
        label: `Review Order : ${20 * pageNumToLoad}-${20 * (pageNumToLoad + 1) - 1}`,
      });
    }
    */
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
    const { _tempCount, _tempReviews } = this.state;
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
      ? t('ui.semester.allSemesters')
      : `${selectedSemester.year} ${getSemesterName(selectedSemester.semester)}`;

    const reviews = _tempReviews;
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
                  {_tempCount}
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
});

const mapDispatchToProps = (dispatch) => ({
  clearReviewsFocusDispatch: () => {
    dispatch(clearReviewsFocus());
  },
});

RankedReviewsSection.propTypes = {
  semesters: PropTypes.arrayOf(semesterShape),
  reviewsFocus: reviewsFocusShape.isRequired,

  clearReviewsFocusDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(RankedReviewsSection));

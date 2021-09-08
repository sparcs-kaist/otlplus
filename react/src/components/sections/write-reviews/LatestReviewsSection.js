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

import { addReviews } from '../../../actions/write-reviews/latestReviews';
import { clearReviewsFocus } from '../../../actions/write-reviews/reviewsFocus';

import reviewShape from '../../../shapes/ReviewShape';
import reviewsFocusShape from '../../../shapes/ReviewsFocusShape';


class LatestReviewsSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
    };

    // eslint-disable-next-line fp/no-mutation
    this.rightSectionRef = React.createRef();
  }


  componentDidMount() {
    const { latestReviews } = this.props;

    if (latestReviews == null) {
      this._fetchLatestReviews();
    }
  }


  _fetchLatestReviews = () => {
    const { latestReviews, addReviewsDispatch } = this.props;
    const { isLoading } = this.state;

    const PAGE_SIZE = 10;

    if (isLoading) {
      return;
    }

    const offset = (latestReviews || []).length;

    this.setState({
      isLoading: true,
    });
    axios.get(
      '/api/reviews',
      {
        params: {
          order: ['-written_datetime'],
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
          isLoading: false,
        }));
        addReviewsDispatch(response.data);
      })
      .catch((error) => {
      });

    if (offset !== 0) {
      ReactGA.event({
        category: 'Write Reviews - Latest Review',
        action: 'Loaded More Review',
        label: `Review Order : ${offset}-${offset + PAGE_SIZE - 1}`,
      });
    }
  }


  handleScroll = () => {
    const SCROLL_THRSHOLD = 100;

    const refElement = this.rightSectionRef.current;
    const sectionPos = refElement.getBoundingClientRect().bottom;
    const scrollPos = refElement.querySelector(`.${classNames('section-content--latest-reviews__list-area')}`).getBoundingClientRect().bottom;
    if (scrollPos - sectionPos < SCROLL_THRSHOLD) {
      this._fetchLatestReviews();
    }
  }


  unfix = () => {
    const { clearReviewsFocusDispatch } = this.props;

    clearReviewsFocusDispatch();
  }


  render() {
    const { t } = this.props;
    const { reviewsFocus, latestReviews } = this.props;

    const reviews = latestReviews;
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
        <Scroller
          key={reviewsFocus.from}
          onScroll={this.handleScroll}
          expandTop={12}
        >
          <div className={classNames('section-content', 'section-content--latest-reviews')}>
            <div className={classNames('title')}>{t('ui.title.latestReviews')}</div>
            { reviewBlocksArea }
          </div>
        </Scroller>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  latestReviews: state.writeReviews.latestReviews.reviews,
  reviewsFocus: state.writeReviews.reviewsFocus,
});

const mapDispatchToProps = (dispatch) => ({
  addReviewsDispatch: (reviews) => {
    dispatch(addReviews(reviews));
  },
  clearReviewsFocusDispatch: () => {
    dispatch(clearReviewsFocus());
  },
});

LatestReviewsSection.propTypes = {
  latestReviews: PropTypes.arrayOf(reviewShape),
  reviewsFocus: reviewsFocusShape.isRequired,

  addReviewsDispatch: PropTypes.func.isRequired,
  clearReviewsFocusDispatch: PropTypes.func.isRequired,
};


// eslint-disable-next-line max-len
export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(LatestReviewsSection));

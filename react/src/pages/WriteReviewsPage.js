import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

import Scroller from '../components/Scroller';
import TakenLecturesSection from '../components/sections/write-reviews/TakenLecturesSection';
import ReviewWriteSubSection from '../components/sections/write-reviews/ReviewWriteSubSection';
import ReviewsSubSection from '../components/sections/write-reviews/ReviewsSubSection';

import { reset as resetReviewsFocus, clearReviewsFocus } from '../actions/write-reviews/reviewsFocus';
import { reset as resetLatestReviews, addReviews as addLatestReviews } from '../actions/write-reviews/latestReviews';
import { reset as resetLikedReviews, setReviews as setLikedReviews } from '../actions/write-reviews/likedReviews';
import { NONE, LECTURE, LATEST } from '../reducers/write-reviews/reviewsFocus';

import reviewsFocusShape from '../shapes/ReviewsFocusShape';
import userShape from '../shapes/UserShape';


class WriteReviewsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      pageNumToLoad: 0,
    };

    // eslint-disable-next-line fp/no-mutation
    this.rightSectionRef = React.createRef();
  }


  componentDidMount() {
    const { user } = this.props;

    this._fetchLatestReviews();
    if (user) {
      this._fetchLikedReviews();
    }
  }


  componentDidUpdate(prevProps) {
    const { user } = this.props;

    if (user && !prevProps.user) {
      this._fetchLikedReviews();
    }
  }


  componentWillUnmount() {
    const { resetReviewsFocusDispatch, resetLatestReviewsDispatch, resetLikedReviewsDispatch } = this.props;

    resetReviewsFocusDispatch();
    resetLatestReviewsDispatch();
    resetLikedReviewsDispatch();
  }


  _fetchLatestReviews = () => {
    const { addLatestReviewsDispatch } = this.props;
    const { isLoading, pageNumToLoad } = this.state;

    const PAGE_SIZE = 10;

    if (isLoading) {
      return;
    }

    this.setState({
      isLoading: true,
    });
    axios.get(
      '/api/reviews',
      {
        params: {
          order: ['-written_datetime'],
          offset: pageNumToLoad * PAGE_SIZE,
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
          pageNumToLoad: prevState.pageNumToLoad + 1,
        }));
        addLatestReviewsDispatch(response.data);
      })
      .catch((error) => {
      });

    if (pageNumToLoad !== 0) {
      ReactGA.event({
        category: 'Write Reviews - Latest Review',
        action: 'Loaded More Review',
        label: `Review Order : ${20 * pageNumToLoad}-${20 * (pageNumToLoad + 1) - 1}`,
      });
    }
  }


  _fetchLikedReviews = () => {
    const { user, setLikedReviewsDispatch } = this.props;

    if (!user) {
      return;
    }

    axios.get(
      `/api/users/${user.id}/liked-reviews`,
      {
        metadata: {
          gaCategory: 'User',
          gaVariable: 'GET Liked Reviews / Instance',
        },
      },
    )
      .then((response) => {
        setLikedReviewsDispatch(response.data);
      })
      .catch((error) => {
      });
  }


  handleScroll = () => {
    const SCROLL_THRSHOLD = 100;

    const { reviewsFocus } = this.props;
    if (reviewsFocus.from !== LATEST) {
      return;
    }

    const refElement = this.rightSectionRef.current;
    const sectionPos = refElement.getBoundingClientRect().bottom;
    const scrollPos = refElement.querySelector(`.${classNames('section-contentt--latest-reviews__list-area')}`).getBoundingClientRect().bottom;
    if (scrollPos - sectionPos < SCROLL_THRSHOLD) {
      this._fetchLatestReviews();
    }
  }


  unfix = () => {
    const { clearReviewsFocusDispatch } = this.props;

    clearReviewsFocusDispatch();
  }


  render() {
    const { t, reviewsFocus } = this.props;

    return (
      <>
        <section className={classNames('content', 'content--no-scroll')}>
          <div className={classNames('section-wrap', 'section-wrap--desktop-1v3--left', 'section-wrap--mobile-full')}>
            <div className={classNames('section')}>
              <TakenLecturesSection />
            </div>
          </div>
          <div
            className={classNames(
              'section-wrap',
              'section-wrap--desktop-1v3--right',
              'mobile-modal',
              ((reviewsFocus.from !== NONE) ? '' : 'mobile-hidden'),
            )}
          >
            <div className={classNames('section')}>
              <div className={classNames('section-content', 'section-content--flex', 'section-content--write-reviews-right')} ref={this.rightSectionRef}>
                <div className={classNames('close-button-wrap')}>
                  <button onClick={this.unfix}>
                    <i className={classNames('icon', 'icon--close-section')} />
                  </button>
                </div>
                { reviewsFocus.from === NONE
                  ? (
                    <div className={classNames('otlplus-placeholder')}>
                      <div>
                        OTL PLUS
                      </div>
                      <div>
                        <Link to="/credits/">{t('ui.menu.credit')}</Link>
                        &nbsp;|&nbsp;
                        <Link to="/licenses/">{t('ui.menu.licences')}</Link>
                      </div>
                      <div>
                        <a href="mailto:otlplus@sparcs.org">otlplus@sparcs.org</a>
                      </div>
                      <div>
                        © 2016,&nbsp;
                        <a href="http://sparcs.org">SPARCS</a>
                        &nbsp;OTL Team
                      </div>
                    </div>
                  )
                  : (
                    <Scroller
                      key={reviewsFocus.from === LECTURE ? reviewsFocus.lecture.id : reviewsFocus.from}
                      onScroll={this.handleScroll}
                      expandTop={12}
                    >
                      <>
                        <ReviewWriteSubSection />
                        <ReviewsSubSection />
                      </>
                    </Scroller>
                  )
                }
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  reviewsFocus: state.writeReviews.reviewsFocus,
});

const mapDispatchToProps = (dispatch) => ({
  addLatestReviewsDispatch: (reviews) => {
    dispatch(addLatestReviews(reviews));
  },
  setLikedReviewsDispatch: (reviews) => {
    dispatch(setLikedReviews(reviews));
  },
  clearReviewsFocusDispatch: () => {
    dispatch(clearReviewsFocus());
  },
  resetReviewsFocusDispatch: () => {
    dispatch(resetReviewsFocus());
  },
  resetLatestReviewsDispatch: () => {
    dispatch(resetLatestReviews());
  },
  resetLikedReviewsDispatch: () => {
    dispatch(resetLikedReviews());
  },
});

WriteReviewsPage.propTypes = {
  user: userShape,
  reviewsFocus: reviewsFocusShape.isRequired,

  addLatestReviewsDispatch: PropTypes.func.isRequired,
  setLikedReviewsDispatch: PropTypes.func.isRequired,
  clearReviewsFocusDispatch: PropTypes.func.isRequired,
  resetReviewsFocusDispatch: PropTypes.func.isRequired,
  resetLatestReviewsDispatch: PropTypes.func.isRequired,
  resetLikedReviewsDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(WriteReviewsPage));

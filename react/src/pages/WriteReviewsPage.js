import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import axios from '../common/presetAxios';
import { BASE_URL } from '../common/constants';
import { appBoundClassNames as classNames } from '../common/boundClassNames';

import TakenLecturesSection from '../components/sections/write-reviews/TakenLecturesSection';
import ReviewWriteSubSection from '../components/sections/write-reviews/ReviewWriteSubSection';
import LatestReviewsSubSection from '../components/sections/write-reviews/LatestReviewsSubSection';
import Scroller from '../components/Scroller';
import { reset as resetLectureSelected, clearLectureSelected } from '../actions/write-reviews/lectureSelected';
import { reset as resetLatestReviews, addReviews } from '../actions/write-reviews/latestReviews';
import lectureShape from '../shapes/LectureShape';


class WriteReviewsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      pageNumToLoad: 0,
    };

    // eslint-disable-next-line fp/no-mutation
    this.rightSectionRef = React.createRef();
  }


  componentDidMount() {
    this._fetchReviews();
  }


  componentWillUnmount() {
    const { resetLectureSelectedDispatch, resetLatestReviewsDispatch } = this.props;

    resetLectureSelectedDispatch();
    resetLatestReviewsDispatch();
  }


  _fetchReviews = () => {
    const { addReviewsDispatch } = this.props;
    const { loading, pageNumToLoad } = this.state;

    if (loading) {
      return;
    }

    this.setState({
      loading: true,
    });
    axios.get(`${BASE_URL}/api/review/latest/${pageNumToLoad}`, {
    })
      .then((response) => {
        this.setState(prevState => ({
          loading: false,
          pageNumToLoad: prevState.pageNumToLoad + 1,
        }));
        addReviewsDispatch(response.data);
      })
      .catch((error) => {
      });
  }


  handleScroll = () => {
    const SCROLL_THRSHOLD = 100;
    const refElement = this.rightSectionRef.current;
    const sectionPos = refElement.getBoundingClientRect().bottom;
    const scrollPos = refElement.querySelector(`.${classNames('section-contentt--latest-reviews__list-area')}`).getBoundingClientRect().bottom;
    if (scrollPos - sectionPos < SCROLL_THRSHOLD) {
      this._fetchReviews();
    }
  }


  unfix = () => {
    const { clearLectureSelectedDispatch } = this.props;

    clearLectureSelectedDispatch();
  }


  render() {
    const { selectedLecture } = this.props;

    return (
      <>
        <section className={classNames('content', 'content--no-scroll')}>
          <div className={classNames('section-wrap', 'section-wrap--desktop-1v3--left', 'section-wrap--mobile-full')}>
            <div className={classNames('section')}>
              <TakenLecturesSection />
            </div>
          </div>
          <div className={classNames('section-wrap', 'section-wrap--desktop-1v3--right', 'mobile-modal', (selectedLecture ? '' : 'mobile-hidden'))}>
            <div className={classNames('section')}>
              <div className={classNames('section-content')} ref={this.rightSectionRef}>
                <button className={classNames('close-button')} onClick={this.unfix}><i className={classNames('icon', 'icon--close-section')} /></button>
                <Scroller onScroll={this.handleScroll}>
                  <ReviewWriteSubSection />
                  <LatestReviewsSubSection />
                </Scroller>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }
}

const mapStateToProps = state => ({
  selectedLecture: state.writeReviews.lectureSelected.lecture,
});

const mapDispatchToProps = dispatch => ({
  addReviewsDispatch: (reviews) => {
    dispatch(addReviews(reviews));
  },
  clearLectureSelectedDispatch: () => {
    dispatch(clearLectureSelected());
  },
  resetLectureSelectedDispatch: () => {
    dispatch(resetLectureSelected());
  },
  resetLatestReviewsDispatch: () => {
    dispatch(resetLatestReviews());
  },
});

WriteReviewsPage.propTypes = {
  selectedLecture: lectureShape,
  addReviewsDispatch: PropTypes.func.isRequired,
  clearLectureSelectedDispatch: PropTypes.func.isRequired,
  resetLectureSelectedDispatch: PropTypes.func.isRequired,
  resetLatestReviewsDispatch: PropTypes.func.isRequired,
};


export default connect(mapStateToProps, mapDispatchToProps)(WriteReviewsPage);

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
import { addReviews } from '../actions/write-reviews/latestReviews';


class WriteReviewsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
    };
  }


  componentDidMount() {
    this._fetchReviews();
  }


  _fetchReviews = () => {
    const { addReviewsDispatch } = this.props;
    const { loading } = this.state;

    if (loading) {
      return;
    }

    this.setState({
      loading: true,
    });
    axios.get(`${BASE_URL}/api/review/latest/0`, {
    })
      .then((response) => {
        this.setState({
          loading: false,
        });
        addReviewsDispatch(response.data);
      })
      .catch((error) => {
      });
  }


  render() {
    return (
      <>
        <section className={classNames('content', 'content--no-scroll')}>
          <div className={classNames('section-wrap', 'section-wrap--desktop-1v3--left', 'section-wrap--mobile-full')}>
            <div className={classNames('section')}>
              <TakenLecturesSection />
            </div>
          </div>
          <div className={classNames('section-wrap', 'section-wrap--desktop-1v3--right', 'mobile-modal', (false ? '' : 'mobile-hidden'))}>
            <div className={classNames('section')}>
              <div className={classNames('section-content')}>
                <Scroller>
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
});

const mapDispatchToProps = dispatch => ({
  addReviewsDispatch: (reviews) => {
    dispatch(addReviews(reviews));
  },
});

WriteReviewsPage.propTypes = {
  addReviewsDispatch: PropTypes.func.isRequired,
};


export default connect(mapStateToProps, mapDispatchToProps)(WriteReviewsPage);

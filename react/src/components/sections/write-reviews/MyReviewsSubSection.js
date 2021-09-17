import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import qs from 'qs';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import Scroller from '../../Scroller';
import ReviewBlock from '../../blocks/ReviewBlock';

import { clearReviewsFocus } from '../../../actions/write-reviews/reviewsFocus';

import userShape from '../../../shapes/UserShape';
import reviewsFocusShape from '../../../shapes/ReviewsFocusShape';


class MyReviewsSubSection extends Component {
  unfix = () => {
    const { clearReviewsFocusDispatch } = this.props;

    clearReviewsFocusDispatch();
  }


  render() {
    const { t } = this.props;
    const { user, reviewsFocus } = this.props;

    if (!user) {
      return null;
    }

    const reviews = user.reviews;
    const reviewBlocksArea = (reviews == null)
      ? <div className={classNames('section-content--latest-reviews__list-area', 'list-placeholder')}><div>{t('ui.placeholder.loading')}</div></div>
      : (reviews.length
        ? <div className={classNames('section-content--latest-reviews__list-area')}>{reviews.map((r) => <ReviewBlock review={r} shouldLimitLines={false} linkTo={{ pathname: '/dictionary', search: qs.stringify({ startCourseId: r.course.id }) }} pageFrom="Write Reviews" key={r.id} />)}</div>
        : <div className={classNames('section-content--latest-reviews__list-area', 'list-placeholder')}><div>{t('ui.placeholder.noResults')}</div></div>);

    return (
      <div className={classNames('section-content', 'section-content--flex', 'section-content--write-reviews-right')}>
        <div className={classNames('close-button-wrap')}>
          <button onClick={this.unfix}>
            <i className={classNames('icon', 'icon--close-section')} />
          </button>
        </div>
        <Scroller
          key={reviewsFocus.from}
          expandTop={12}
        >
          <div className={classNames('section-content', 'section-content--latest-reviews')}>
            <div className={classNames('title')}>{t('ui.title.myReviews')}</div>
            { reviewBlocksArea }
          </div>
        </Scroller>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  reviewsFocus: state.writeReviews.reviewsFocus,
});

const mapDispatchToProps = (dispatch) => ({
  clearReviewsFocusDispatch: () => {
    dispatch(clearReviewsFocus());
  },
});

MyReviewsSubSection.propTypes = {
  user: userShape,
  reviewsFocus: reviewsFocusShape.isRequired,

  clearReviewsFocusDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(MyReviewsSubSection));

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import qs from 'qs';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import Scroller from '../../../Scroller';
import CloseButton from '../../../CloseButton';
import ReviewBlock from '../../../blocks/ReviewBlock';

import { clearReviewsFocus } from '../../../../actions/write-reviews/reviewsFocus';

import userShape from '../../../../shapes/model/session/UserShape';
import reviewsFocusShape from '../../../../shapes/state/write-reviews/ReviewsFocusShape';


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
              <div className={classNames('block-list', 'min-height-area')}>
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
        <Scroller
          key={reviewsFocus.from}
          expandTop={12}
        >
          <div className={classNames('title')}>{t('ui.title.myReviews')}</div>
          { reviewBlocksArea }
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


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    MyReviewsSubSection
  )
);

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import ReviewWriteBlock from '../../blocks/ReviewWriteBlock';

import { updateUserReview } from '../../../actions/common/user';

import lectureShape from '../../../shapes/NestedLectureShape';
import reviewShape from '../../../shapes/ReviewShape';


class ReviewWriteSection extends Component {
  updateOnReviewSubmit = (review, isNew) => {
    const { updateUserReviewDispatch } = this.props;
    updateUserReviewDispatch(review);
  }


  render() {
    const { t } = this.props;
    const { lecture, review } = this.props;

    return (
      <div className={classNames('section-content', 'section-content--widget')}>
        <div className={classNames('title')}>
          {`${t('ui.title.writeReview')} - ${lecture[t('js.property.title')]}`}
        </div>
        <ReviewWriteBlock lecture={lecture} review={review} pageFrom="Main" updateOnSubmit={this.updateOnReviewSubmit} />
        <div className={classNames('buttons')}>
          <Link to="/write-reviews" className={classNames('text-button')}>
            {t('ui.button.writeMoreReviews')}
          </Link>
        </div>
      </div>
    );
  }
}


const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => ({
  updateUserReviewDispatch: (review) => {
    dispatch(updateUserReview(review));
  },
});

ReviewWriteSection.propTypes = {
  review: reviewShape,
  lecture: lectureShape.isRequired,

  updateUserReviewDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(ReviewWriteSection));

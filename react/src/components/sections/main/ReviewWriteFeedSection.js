import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import ReviewWriteBlock from '../../blocks/ReviewWriteBlock';

import { updateUserReview } from '../../../actions/common/user';

import lectureShape from '../../../shapes/model/subject/LectureShape';
import reviewShape from '../../../shapes/model/review/ReviewShape';


class ReviewWriteFeedSection extends Component {
  updateOnReviewSubmit = (review, isNew) => {
    const { updateUserReviewDispatch } = this.props;
    updateUserReviewDispatch(review);
  }


  render() {
    const { t } = this.props;
    const { lecture, review } = this.props;

    return (
    // eslint-disable-next-line react/jsx-indent
    <div className={classNames('section', 'section--feed')}>
      <div className={classNames('subsection', 'subsection--feed')}>
        <div className={classNames('title')}>
          {`${t('ui.title.writeReview')} - ${lecture[t('js.property.title')]}`}
        </div>
        <ReviewWriteBlock
          lecture={lecture}
          review={review}
          pageFrom="Main"
          updateOnSubmit={this.updateOnReviewSubmit}
        />
        <div className={classNames('buttons')}>
          <Link to="/write-reviews" className={classNames('text-button')}>
            {t('ui.button.writeMoreReviews')}
          </Link>
        </div>
      </div>
    </div>
    );
  }
}


const mapStateToProps = (state) => ({
});

const mapDispatchToProps = (dispatch) => ({
  updateUserReviewDispatch: (review) => {
    dispatch(updateUserReview(review));
  },
});

ReviewWriteFeedSection.propTypes = {
  review: reviewShape,
  lecture: lectureShape.isRequired,

  updateUserReviewDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    ReviewWriteFeedSection
  )
);

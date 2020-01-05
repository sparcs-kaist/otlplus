import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import ReviewWriteBlock from '../../blocks/ReviewWriteBlock';
import lectureShape from '../../../shapes/NestedLectureShape';
import reviewShape from '../../../shapes/ReviewShape';


class ReviewWriteSection extends Component {
  render() {
    const { t } = this.props;
    const { lecture, review } = this.props;

    console.log(review);

    return (
      <div className={classNames('section-content', 'section-content--widget')}>
        <div className={classNames('title')}>
          {`${t('ui.title.writeReview')} - ${lecture[t('js.property.title')]}`}
        </div>
        <ReviewWriteBlock lecture={lecture} review={review} />
        <div className={classNames('buttons')}>
          <button className={classNames('text-button')}>
            {t('ui.button.writeMoreReviews')}
          </button>
        </div>
      </div>
    );
  }
}

ReviewWriteSection.propTypes = {
  review: reviewShape,
  lecture: lectureShape.isRequired,
};


export default withTranslation()(ReviewWriteSection);

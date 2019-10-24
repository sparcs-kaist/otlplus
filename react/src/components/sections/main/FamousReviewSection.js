import React, { Component } from 'react';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import ReviewBlock from '../../blocks/ReviewBlock';
import reviews from '../../../dummy/reviews';


class FamousReviewSection extends Component {
  render() {
    return (
      <div className={classNames('section-content', 'section-content--widget')}>
        <div className={classNames('title')}>
          사랑받는 전공 후기 - 전산학부
        </div>
        {reviews.map(r => <ReviewBlock review={r} key={r.id} />)}
        <div className={classNames('buttons')}>
          <button className={classNames('text-button')}>
            후기 더 보기
          </button>
        </div>
      </div>
    );
  }
}


export default FamousReviewSection;

import React, { Component } from 'react';

import ReviewBlock from '../../blocks/ReviewBlock';
import reviews from '../../../dummy/reviews';


class FamousReviewSection extends Component {
  render() {
    return (
      <div className="section-content section-content--widget">
        <div className="title">
          사랑받는 전공 후기 - 전산학부
        </div>
        {reviews.map(r => <ReviewBlock review={r} />)}
        <div className="buttons">
          <button className="text-button">
            후기 더 보기
          </button>
        </div>
      </div>
    );
  }
}


export default FamousReviewSection;

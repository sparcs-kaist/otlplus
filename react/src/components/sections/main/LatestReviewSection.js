import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import ReviewBlock from '../../blocks/ReviewBlock';
import reviews from '../../../dummy/reviews';


class LatestReviewSection extends Component {
  render() {
    return (
      <div className={classNames('section-content', 'section-content--widget')}>
        <div className={classNames('title')}>
          따끈따끈 과목후기
        </div>
        {reviews.map(r => (
          <Link to={{ pathname: '/dictionary', state: { startCourseId: r.course.id } }}>
            <ReviewBlock review={r} key={r.id} />
          </Link>
        ))}
        <div className={classNames('buttons')}>
          <button className={classNames('text-button')}>
            후기 더 보기
          </button>
        </div>
      </div>
    );
  }
}


export default LatestReviewSection;

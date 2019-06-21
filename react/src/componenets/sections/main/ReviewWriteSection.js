import React, { Component } from 'react';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import ReviewWriteBlock from '../../blocks/ReviewWriteBlock';


class ReviewWriteSection extends Component {
  render() {
    return (
      <div className={classNames('section-content', 'section-content--widget')}>
        <div className={classNames('title')}>
          후기 작성 - 운영체제 및 실험
        </div>
        <ReviewWriteBlock />
        <div className={classNames('buttons')}>
          <button className={classNames('text-button')}>
            후기 더 작성하기
          </button>
        </div>
      </div>
    );
  }
}


export default ReviewWriteSection;

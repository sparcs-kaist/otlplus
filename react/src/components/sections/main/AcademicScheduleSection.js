import React, { Component } from 'react';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';


class AcademicScheduleSection extends Component {
  render() {
    return (
      <div className={classNames('section-content', 'section-content--widget')}>
        <div className={classNames('academic-schedule')}>
          <div>
            D-4일 13시간 22분 07초
          </div>
          <div>
            <strong>봄학기 수강취소 마감</strong>
            <span>2018.1.3</span>
          </div>
        </div>
        <div className={classNames('buttons')}>
          <button className={classNames('text-button')}>
            학사시스템 바로가기
          </button>
        </div>
      </div>
    );
  }
}


export default AcademicScheduleSection;

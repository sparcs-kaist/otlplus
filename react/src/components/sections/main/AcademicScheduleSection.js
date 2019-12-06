import React, { Component } from 'react';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';


class AcademicScheduleSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      today: new Date(),
    };
  }

  componentDidMount() {
    this.interval = setInterval(() => this.setState({ today: new Date() }), 100);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }


  render() {
    const { today } = this.state;

    const targetScheduleTime = new Date(2020, 3, 2);
    const timeDiff = targetScheduleTime - today;

    const seconds = Math.floor((timeDiff / 1000) % 60);
    const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
    const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    return (
      <div className={classNames('section-content', 'section-content--widget')}>
        <div className={classNames('academic-schedule')}>
          <div>
            {`D-${days}일 ${hours}시간 ${minutes}분 ${seconds}초`}
          </div>
          <div>
            <strong>봄학기 수강취소 마감</strong>
            <span>{`${targetScheduleTime.getFullYear()}.${targetScheduleTime.getMonth()}.${targetScheduleTime.getDate()}`}</span>
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

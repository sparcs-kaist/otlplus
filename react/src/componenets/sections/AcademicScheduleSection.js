import React, { Component } from 'react';


class AcademicScheduleSection extends Component {
  render() {
    return (
      <div className="section-content section-content--widget">
        <div className="academic-schedule">
          <div>
            D-4일 13시간 22분 07초
          </div>
          <div>
            <strong>봄학기 수강취소 마감</strong><span>2018.1.3</span>
          </div>
        </div>
        <div className="buttons">
          <button className="text-button">
            학사시스템 바로가기
          </button>
        </div>
      </div>
    );
  }
}


export default AcademicScheduleSection;

import React, { Component } from 'react';

import CourseBlock from "../../dictionary/components/CourseBlock";


class RelatedCourseSection extends Component {
    render() {
        return (
            <div className="section-content section-content--widget">
                <div className="section-title section-title--widget">
                    연관 과목 - 데이타구조
                </div>
                <CourseBlock/>
                <CourseBlock/>
                <CourseBlock/>
                <div className="view-detail">
                    <span className="text-button text-button--view-detail">
                        자세히 보기
                    </span>
                </div>
            </div>
        );
    }
}


export default RelatedCourseSection;

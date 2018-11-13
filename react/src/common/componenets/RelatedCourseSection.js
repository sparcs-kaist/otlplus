import React, { Component } from 'react';

import CourseBlock from "../../dictionary/components/CourseBlock";


class RelatedCourseSection extends Component {
    render() {
        return (
            <div className="section-content section-content--widget">
                <div className="section-title section-title--widget">
                    따끈따끈 과목후기
                </div>
                <CourseBlock/>
                <CourseBlock/>
                <CourseBlock/>
                <div className="view-detail">
                    <span className="text-button text-button--view-detail">
                        후기 더 보기
                    </span>
                </div>
            </div>
        );
    }
}


export default RelatedCourseSection;

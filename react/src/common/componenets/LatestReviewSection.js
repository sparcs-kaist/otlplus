import React, { Component } from 'react';

import ReviewBlock from "../../dictionary/components/ReviewBlock";


class LatestReviewSection extends Component {
    render() {
        return (
            <div className="section-content section-content--widget">
                <div className="title">
                    따끈따끈 과목후기
                </div>
                <ReviewBlock/>
                <ReviewBlock/>
                <ReviewBlock/>
                <div className="buttons">
                    <button className="text-button text-button--view-detail">
                        후기 더 보기
                    </button>
                </div>
            </div>
        );
    }
}


export default LatestReviewSection;

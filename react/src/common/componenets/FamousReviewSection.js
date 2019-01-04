import React, { Component } from 'react';

import ReviewBlock from "../../dictionary/components/ReviewBlock";


class FamousReviewSection extends Component {
    render() {
        return (
            <div className="section-content section-content--widget">
                <div className="title">
                    사랑받는 전공 후기 - 전산학부
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


export default FamousReviewSection;

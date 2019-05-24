import React, { Component } from 'react';

import ReviewWriteBlock from "../blocks/ReviewWriteBlock";


class ReviewWriteSection extends Component {
    render() {
        return (
            <div className="section-content section-content--widget">
                <div className="title">
                    후기 작성 - 운영체제 및 실험
                </div>
                <ReviewWriteBlock/>
                <div className="buttons">
                    <button className="text-button">
                        후기 더 작성하기
                    </button>
                </div>
            </div>
        );
    }
}


export default ReviewWriteSection;

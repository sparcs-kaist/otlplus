import React, { Component } from 'react';
import ReviewBlock from "./ReviewBlock";
import Scroller from "../../common/Scroller";


class CourseDetailSection extends Component {
    render() {
        return (
            <div className="section-content">
                <Scroller>
                    <ReviewBlock/>
                    <ReviewBlock/>
                    <ReviewBlock/>
                    <ReviewBlock/>
                </Scroller>
            </div>
        );
    }
}


export default CourseDetailSection;

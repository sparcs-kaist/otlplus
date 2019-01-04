import React, { Component } from 'react';

import Header from "./Header";
import Footer from "./Footer";

import RelatedCourseSection from "./componenets/RelatedCourseSection";
import LatestReviewSection from "./componenets/LatestReviewSection";
import FamousReviewSection from "./componenets/FamousReviewSection";
import ReviewWriteSection from "./componenets/ReviewWriteSection";


class MainPage extends Component {
    render() {
        return (
            <div>
                <Header user={this.props.user}/>
                <section className="content">
                    <div className="section-wrap">
                        <div className="section">
                            <ReviewWriteSection/>
                        </div>
                    </div>
                    <div className="section-wrap">
                        <div className="section">
                            <RelatedCourseSection/>
                        </div>
                    </div>
                    <div className="section-wrap">
                        <div className="section">
                            <LatestReviewSection/>
                        </div>
                    </div>
                    <div className="section-wrap">
                        <div className="section">
                            <FamousReviewSection/>
                        </div>
                    </div>
                </section>
                <Footer />
            </div>
        );
    }
}

export default MainPage;

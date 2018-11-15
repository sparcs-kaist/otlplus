import React, { Component } from 'react';

import Header from "./Header";
import Footer from "./Footer";

import RelatedCourseSection from "./componenets/RelatedCourseSection";
import LatestReviewSection from "./componenets/LatestReviewSection";


class MainPage extends Component {
    render() {
        return (
            <div>
                <Header user={this.props.user}/>
                <section className="content">
                    <div className="section">
                        <RelatedCourseSection/>
                    </div>
                    <div className="section">
                        <LatestReviewSection/>
                    </div>
                </section>
                <Footer />
            </div>
        );
    }
}

export default MainPage;

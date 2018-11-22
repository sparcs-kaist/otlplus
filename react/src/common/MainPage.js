<<<<<<< HEAD
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import "../static/css/review/search.css";

import Header from "./Header";
import Footer from "./Footer";

class MainPage extends Component {
    render() {
        return (
            <div className="main">
                <Header user={this.props.user}/>
                <section id="contents" className="container-fluid">
                    <div className="row">
                        <div className="col-xs-22 col-xs-offset-1 col-sm-20 col-sm-offset-2 col-md-18 col-md-offset-3 col-lg-16 col-lg-offset-4 text-center">
                            <form className="row">
                                <div className="search_bar col-xs-24 col-sm-14 col-md-16 col-lg-18">
                                    <input id="keyword" type="text" name="q" autoComplete="on" className="form-control" placeholder="Search"/>
                                </div>
                                <div className="search_bar col-xs-12 col-sm-5 col-md-4 col-lg-3">
                                    <div id="option" type="button" className="btn btn-lg btn-block btn-danger">
                                        필터
                                    </div>
                                </div>
                                <div className="search_bar col-xs-12 col-sm-5 col-md-4 col-lg-3">
                                    <input type="submit" className="btn btn-lg btn-block btn-danger" formAction="/review/result" value="검색"/>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-22 col-xs-offset-1 col-sm-10 col-sm-offset-2 col-md-9 col-md-offset-3 col-lg-8 col-lg-offset-4">
                            <h2 className=" text-center" style={{cursor:"default"}}>
                                사랑받는 교양 후기
                            </h2>
                        </div>
                        <div className="col-xs-22 col-xs-offset-1 col-sm-10 col-sm-offset-0 col-md-9 col-md-offset-0 col-lg-8 col-lg-offset-0">
                            <h2 className=" text-center" style={{cursor:"default"}}>
                                사랑받는 전공 후기
                            </h2>
                        </div>
                    </div>
                </section>
                <Footer />
            </div>
        );
    }
}

export default MainPage;
=======
import React, { Component } from 'react';

import Header from "./Header";
import Footer from "./Footer";

import RelatedCourseSection from "./componenets/RelatedCourseSection";
import LatestReviewSection from "./componenets/LatestReviewSection";
import FamousReviewSection from "./componenets/FamousReviewSection";


class MainPage extends Component {
    render() {
        return (
            <div>
                <Header user={this.props.user}/>
                <section className="content">
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
>>>>>>> develop

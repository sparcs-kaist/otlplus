import React, { Component } from 'react';

import Header from "../common/Header";

import "../App.scss";


class DictionaryPage extends Component {
    render() {
        return (
            <div>
                <Header user={this.props.user}/>
                <section className="content content--no-scroll">
                    <div className="section-wrap section-wrap--course-list">
                        <div className="tab--course-list">
                        </div>
                        <div className="section section--with-tabs">
                            asdf
                        </div>
                    </div>
                    <div className="section-wrap section-wrap--course-detail">
                        <div className="section">
                            asdf
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}



export default DictionaryPage;

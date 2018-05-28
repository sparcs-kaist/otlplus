import React, { Component } from 'react';

import Header from "../common/Header";

class ResultPage extends Component {
    render() {
        return (
            <div>
                <Header user={this.props.user}/>
                <section id="content" className="container-fluid">
                    ResultPage
                </section>
            </div>
        )
    }
}

export default ResultPage;

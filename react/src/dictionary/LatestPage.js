import React, { Component } from 'react';

import Header from "../common/Header";

class LatestPage extends Component {
    render() {
        return (
            <div>
                <Header user={this.props.user}/>
                <section id="content" className="container-fluid">
                    LatestPage
                </section>
            </div>
        )
    }
}

export default LatestPage;

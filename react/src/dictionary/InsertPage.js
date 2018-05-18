import React, { Component } from 'react';

import Header from "../common/Header";

class InsertPage extends Component {
    render() {
        return (
            <div>
                <Header user={this.props.user}/>
                <section id="content" className="container-fluid">
                    InsertPage
                </section>
            </div>
        )
    }
}

export default InsertPage;

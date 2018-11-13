import React, { Component } from 'react';

import Header from "./Header";
import Footer from "./Footer";

class MainPage extends Component {
    render() {
        return (
            <div>
                <Header user={this.props.user}/>
                <section>
                </section>
                <Footer />
            </div>
        );
    }
}

export default MainPage;

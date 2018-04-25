import React, { Component } from 'react';

class Semester extends Component {
    render() {
        console.log(this.props);
        return (
            <div id="semester">
                <div id="semester-prev"><i></i></div>
                <span id="semester-text">2018 봄</span>
                <div id="semester-next"><i></i></div>
            </div>
        );
    }
}

export default Semester;

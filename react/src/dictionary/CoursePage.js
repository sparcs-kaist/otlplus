import React, { Component } from 'react';

import Header from "../common/Header";

class CoursePage extends Component {
    render() {
        return (
            <div>
                <Header user={this.props.user}/>
                <section id="content" className="container-fluid">
                    CoursePage <br/>
                    course_id : {this.props.match.params.course_id} <br/>
                    professors_code : {this.props.match.params.professors_code}
                </section>
            </div>
        )
    }
}

export default CoursePage;

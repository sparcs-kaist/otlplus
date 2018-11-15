import React, { Component } from 'react';

import Header from "../common/Header";

class ProfessorPage extends Component {
    render() {
        return (
            <div>
                <Header user={this.props.user}/>
                <section id="content" className="container-fluid">
                    ProfessorPage <br/>
                    professor_id : {this.props.match.params.professor_id} <br/>
                    course_id : {this.props.match.params.course_id}
                </section>
            </div>
        )
    }
}

export default ProfessorPage;

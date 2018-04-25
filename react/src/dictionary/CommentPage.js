import React, { Component } from 'react';

import Header from "../common/Header";

class CommentPage extends Component {
    render() {
        return (
            <div>
                <Header/>
                <section id="content" className="container-fluid">
                    CommentPage <br/>
                    comment_id : {this.props.match.params.comment_id}
                </section>
            </div>
        )
    }
}

export default CommentPage;

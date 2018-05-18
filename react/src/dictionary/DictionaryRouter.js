import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import LatestPage from "./LatestPage";
import CommentPage from "./CommentPage";
import ProfessorPage from "./ProfessorPage";
import CoursePage from "./CoursePage";
import ResultPage from "./ResultPage";
import InsertPage from "./InsertPage";

class DictionaryRouter extends Component {
    render() {
        return (
            <Switch>
                <Route exact path="/review" render={(props)=><LatestPage user={this.props.user}/>}/>
                <Route path="/review/result/comment/:comment_id" render={(props)=><CommentPage user={this.props.user}/>}/>
                <Route path="/review/result/professor/:professor_id/:course_id" render={(props)=><ProfessorPage user={this.props.user}/>}/>
                <Route path="/review/result/course/:course_id/:professors_code" render={(props)=><CoursePage user={this.props.user}/>}/>
                <Route exact path="/review/result" render={(props)=><ResultPage user={this.props.user}/>}/>
                <Route exact path="/review/insert" render={(props)=><InsertPage user={this.props.user}/>}/>
            </Switch>
        );
    }
}

export default DictionaryRouter;
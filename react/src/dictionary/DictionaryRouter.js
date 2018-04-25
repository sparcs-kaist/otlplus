import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

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
                <Route exact path="/review" component={LatestPage}/>
                <Route path="/review/result/comment/:comment_id" component={CommentPage}/>
                <Route path="/review/result/professor/:professor_id/:course_id" component={ProfessorPage}/>
                <Route path="/review/result/course/:course_id/:professors_code" component={CoursePage}/>
                <Route exact path="/review/result" component={ResultPage}/>
                <Route exact path="/review/insert" component={InsertPage}/>
            </Switch>
        );
    }
}

export default DictionaryRouter;
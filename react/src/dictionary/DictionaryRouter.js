import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import LatestPage from "./LatestPage";
import CommentPage from "./CommentPage";
import ProfessorPage from "./ProfessorPage";
import CoursePage from "./CoursePage";
import ResultPage from "./ResultPage";
import InsertPage from "./InsertPage";

import Header from "../common/Header";
import Footer from "../common/Footer";

class DictionaryRouter extends Component {
    constructor(props) {
      super(props);
      this.state = {
        bottom: false,
      };
      this.unbindBottom = this.unbindBottom.bind(this);
    }

    unbindBottom() {
      this.setState({
        bottom: false,
      });
    }

    componentWillMount() {
      document.addEventListener('scroll', () => {
        // if ($(window).scrollTop() > $(document).height() - ($(window).height()*2)) {
        //   $(window).unbind();
        //   loadItems();
        // }
        const documentHeight = Math.max(
          document.body.scrollHeight, document.documentElement.scrollHeight,
          document.body.offsetHeight, document.documentElement.offsetHeight,
          document.body.clientHeight, document.documentElement.clientHeight
        );
        if(window.pageYOffset > documentHeight - 2*window.innerHeight) {
          if(!this.state.bottom) {
            this.setState({
              bottom: true,
            });
          }
        }
      });
    }

    render() {
        return (
          <div>
            <Header user={this.props.user}/>
            <section id="contents" className="container-fluid">
              <Switch>
                <Route exact path="/review" render={(props)=><LatestPage bottom={this.state.bottom} unbindBottom={this.unbindBottom} user={this.props.user}/>}/>
                <Route path="/review/result/comment/:comment_id" render={(props)=><CommentPage user={this.props.user}/>}/>
                <Route path="/review/result/professor/:professor_id/:course_id" render={(props)=><ProfessorPage user={this.props.user}/>}/>
                <Route path="/review/result/course/:course_id/:professors_code" render={(props)=><CoursePage user={this.props.user}/>}/>
                <Route exact path="/review/result" render={(props)=><ResultPage bottom={this.state.bottom} user={this.props.user}/>}/>
                <Route exact path="/review/insert" render={(props)=><InsertPage user={this.props.user}/>}/>
              </Switch>
            </section>
            <Footer />
          </div>
        );
    }
}

export default DictionaryRouter;
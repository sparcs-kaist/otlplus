import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import axios from 'axios';

import './static/css/bootstrap.min.css';
import './static/css/global.css';

import TimetablePage from "./timetable/TimetablePage";
import DictionaryRouter from "./dictionary/DictionaryRouter";
import MainPage from "./common/MainPage";
import CreditPage from "./common/CreditPage";
import LicensePage from "./common/LicensePage";


class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: null,
        };
    }

    componentDidMount() {
        axios.get("/session/info")
        .then((response) => {
            this.setState((prevState) => {
                return {
                    user: response.data,
                }
            });
        })
        .catch((response) => {
            console.log(response);
        });
    }

  render() {
    return (
        <Switch>
            <Route path="/review" render={(props)=><DictionaryRouter user={this.state.user}/>}/>
            <Route exact path="/timetable" render={(props)=><TimetablePage user={this.state.user}/>}/>
            <Route exact path="/main" render={(props)=><MainPage user={this.state.user}/>}/>
            <Route exact path="/credits" render={(props)=><CreditPage user={this.state.user}/>}/>
            <Route exact path="/licenses" render={(props)=><LicensePage user={this.state.user}/>}/>
            <Redirect from="/" to="/main/"/>
        </Switch>
    );
  }
}

export default App;

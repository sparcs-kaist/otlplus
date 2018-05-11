import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import './static/css/bootstrap.min.css';
import './static/css/font-awesome.min.css';
import './static/css/global.css';

import TimetablePage from "./timetable/TimetablePage";
import DictionaryRouter from "./dictionary/DictionaryRouter";
import MainPage from "./common/MainPage";
import CreditPage from "./common/CreditPage";
import LicensePage from "./common/LicensePage";


class App extends Component {
  render() {
    return (
        <Switch>
            <Route path="/review" component={DictionaryRouter}/>
            <Route exact path="/timetable" component={TimetablePage}/>
            <Route exact path="/main" component={MainPage}/>
            <Route exact path="/credits" component={CreditPage}/>
            <Route exact path="/licenses" component={LicensePage}/>
            <Redirect from="/" to="/main/"/>
        </Switch>
    );
  }
}

export default App;

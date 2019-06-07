import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import axios from 'axios';
import 'bootstrap';

import './static/css/bootstrap.min.css';
import './static/css/global.css';

import DictionaryPage from './pages/DictionaryPage';
import TimetablePage from './pages/TimetablePage';
import Syllabus from './timetable/components/Syllabus';
import MainPage from './pages/MainPage';
import CreditPage from './pages/CreditPage';
import LicensePage from './pages/LicensePage';

import timetableReducer from './timetable/reducers/index';
import commonReducer from './reducers/user';
import { setUser } from './actions/user';
import TestPage from './TestPage';

const store = createStore(combineReducers({
  common: commonReducer,
  timetable: timetableReducer,
}));

class App extends Component {
  componentDidMount() {
    axios.get('/session/info')
      .then((response) => {
        store.dispatch(setUser(response.data));
      })
      .catch((response) => {
        console.log(response);
      });
  }

  render() {
    return (
      <Provider store={store}>
        <Switch>
          <Route path="/dictionary" render={props => <DictionaryPage />} />
          <Route exact path="/timetable" render={props => <TimetablePage />} />
          <Route exact path="/timetable/syllabus" component={Syllabus} />
          <Route exact path="/main" render={props => <MainPage />} />
          <Route exact path="/credits" render={props => <CreditPage />} />
          <Route exact path="/licenses" render={props => <LicensePage />} />
          <Route exact path="/test" render={props => <TestPage />} /> {/* Temporary test page for axiom */}
          <Redirect from="/" to="/main/" />
        </Switch>
      </Provider>
    );
  }
}

export default App;

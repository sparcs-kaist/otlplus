import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import 'bootstrap';

import './static/css/bootstrap.min.css';
import './static/css/global.css';

import DictionaryPage from './pages/DictionaryPage';
import TimetablePage from './pages/TimetablePage';
import SyllabusPage from './pages/SyllabusPage';
import MainPage from './pages/MainPage';
import CreditPage from './pages/CreditPage';
import LicensePage from './pages/LicensePage';

import axios from './presetAxios';
import { BASE_URL } from './constants';
import timetableReducer from './reducers/timetable/index';
import commonReducer from './reducers/user';
import { setUser } from './actions/user';
import TestPage from './pages/TestPage';

const store = createStore(combineReducers({
  common: commonReducer,
  timetable: timetableReducer,
}));

class App extends Component {
  componentDidMount() {
    axios.get(`${BASE_URL}/session/info`)
      .then((response) => {
        store.dispatch(setUser(response.data));
      })
      .catch((response) => {
      });
  }

  render() {
    return (
      <Provider store={store}>
        <Switch>
          <Route path="/dictionary" render={props => <DictionaryPage />} />
          <Route exact path="/timetable" render={props => <TimetablePage />} />
          <Route exact path="/timetable/syllabus" component={SyllabusPage} />
          <Route exact path="/main" render={props => <MainPage />} />
          <Route exact path="/credits" render={props => <CreditPage />} />
          <Route exact path="/licenses" render={props => <LicensePage />} />
          {/* Temporary test page for axiom */}
          <Route exact path="/test" render={props => <TestPage />} />
          <Redirect from="/" to="/main/" />
        </Switch>
      </Provider>
    );
  }
}

export default App;

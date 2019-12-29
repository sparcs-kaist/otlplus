import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';

import Header from './components/guideline/Header';
import DictionaryPage from './pages/DictionaryPage';
import TimetablePage from './pages/TimetablePage';
import SyllabusPage from './pages/SyllabusPage';
import MainPage from './pages/MainPage';
import CreditPage from './pages/CreditPage';
import LicensePage from './pages/LicensePage';

import './common/i18n';
import axios from './common/presetAxios';
import { BASE_URL } from './common/constants';
import dictionaryReducer from './reducers/dictionary/index';
import timetableReducer from './reducers/timetable/index';
import commonReducer from './reducers/common/index';
import { setUser } from './actions/common/user';
import { setSemesters } from './actions/common/semester';
import TestPage from './pages/TestPage';

const store = createStore(combineReducers({
  common: commonReducer,
  dictionary: dictionaryReducer,
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
    axios.get(`${BASE_URL}/api/semesters`, {
    })
      .then((response) => {
        store.dispatch(setSemesters(response.data));
      })
      .catch((response) => {
      });
  }

  render() {
    return (
      <Provider store={store}>
        <>
          <Header />
          <Switch>
            <Route path="/dictionary" component={DictionaryPage} />
            <Route exact path="/timetable" component={TimetablePage} />
            <Route exact path="/timetable/syllabus" component={SyllabusPage} />
            <Route exact path="/main" component={MainPage} />
            <Route exact path="/credits" component={CreditPage} />
            <Route exact path="/licenses" component={LicensePage} />
            {/* Temporary test page for axiom */}
            <Route exact path="/test" component={TestPage} />
            <Redirect from="/" to="/main/" />
          </Switch>
        </>
      </Provider>
    );
  }
}

export default App;

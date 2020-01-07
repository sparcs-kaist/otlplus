import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';

import Header from './components/guideline/Header';
import DictionaryPage from './pages/DictionaryPage';
import TimetablePage from './pages/TimetablePage';
import WriteReviewsPage from './pages/WriteReviewsPage';
import SyllabusPage from './pages/SyllabusPage';
import MainPage from './pages/MainPage';
import AccountPage from './pages/AccountPage';
import CreditPage from './pages/CreditPage';
import LicensePage from './pages/LicensePage';

import './common/i18n';
import axios from './common/presetAxios';
import { BASE_URL } from './common/constants';
import dictionaryReducer from './reducers/dictionary/index';
import timetableReducer from './reducers/timetable/index';
import writeReviewsReducer from './reducers/write-reviews/index';
import commonReducer from './reducers/common/index';
import { setUser } from './actions/common/user';
import { setSemesters } from './actions/common/semester';
import TestPage from './pages/TestPage';
import ErrorPage from './pages/ErrorPage';

const store = createStore(combineReducers({
  common: commonReducer,
  dictionary: dictionaryReducer,
  timetable: timetableReducer,
  writeReviews: writeReviewsReducer,
}));

class App extends Component {
  componentDidMount() {
    axios.get(`${BASE_URL}/session/info`)
      .then((response) => {
        store.dispatch(setUser(response.data));
      })
      .catch((error) => {
      });
    axios.get(`${BASE_URL}/api/semesters`, {
    })
      .then((response) => {
        store.dispatch(setSemesters(response.data));
      })
      .catch((error) => {
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
            <Route exact path="/write-reviews" component={WriteReviewsPage} />
            <Route exact path="/account" component={AccountPage} />
            <Route exact path="/credits" component={CreditPage} />
            <Route exact path="/licenses" component={LicensePage} />
            {/* Temporary test page for axiom */}
            <Route exact path="/test" component={TestPage} />
            <Route exact path="/error/:message" component={ErrorPage} />
            <Redirect from="/" to="/main/" />
          </Switch>
        </>
      </Provider>
    );
  }
}

export default App;

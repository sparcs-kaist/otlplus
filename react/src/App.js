import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import axios from 'axios';
import qs from 'qs';

import Header from './common/guideline/components/Header';
import DictionaryPage from './pages/DictionaryPage';
import PlannerPage from './pages/PlannerPage';
import TimetablePage from './pages/TimetablePage';
import WriteReviewsPage from './pages/WriteReviewsPage';
import SyllabusPage from './pages/SyllabusPage';
import MainPage from './pages/MainPage';
import AccountPage from './pages/AccountPage';
import CreditPage from './pages/CreditPage';
import LicensePage from './pages/LicensePage';
import TestPage from './pages/TestPage';
import ErrorPage from './pages/ErrorPage';

import dictionaryReducer from './reducers/dictionary/index';
import timetableReducer from './reducers/timetable/index';
import writeReviewsReducer from './reducers/write-reviews/index';
import commonReducer from './reducers/common/index';

import { setUser } from './actions/common/user';
import { setSemesters } from './actions/common/semester';
import { setIsPortrait } from './actions/common/media';


const store = createStore(combineReducers({
  common: commonReducer,
  dictionary: dictionaryReducer,
  timetable: timetableReducer,
  writeReviews: writeReviewsReducer,
}));

class App extends Component {
  portraitMediaQuery = window.matchMedia('(max-aspect-ratio: 4/3)')

  componentDidMount() {
    this._fetchUser();

    this._fetchSemesters();

    this._updateSizeProperty();
    window.addEventListener('resize', this._updateSizeProperty);

    this._updateIsPortrait();
    this.portraitMediaQuery.addEventListener('change', this._updateIsPortrait);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._updateSizeProperty);

    this.portraitMediaQuery.removeEventListener('change', this._updateIsPortrait);
  }

  _fetchUser = () => {
    axios.get(
      '/session/info',
      {
        metadata: {
          gaCategory: 'User',
          gaVariable: 'Get / Instance',
        },
      },
    )
      .then((response) => {
        const dumpUser = {
          departments: [],
          email: "mini@sparcs.org",
          favorite_departments: [],
          firstName: "동혁",
          id: 1,
          lastName: "김",
          majors: [{
            id: 1,
            name: "산디과",
            name_en: "sandi",
            code: "industrial"
          }],
          my_timetable_lectures: [],
          review_writable_lectures: [{
            class_no: "C",
            class_title: "C",
            class_title_en: "C",
            classtimes: [],
            code: "21.120",
            common_title: "일반생물학",
            common_title_en: "General Biology",
            course: 40,
            credit: 3,
            credit_au: 0,
            department: 132,
            department_code: "BS",
            department_name: "생명과학과",
            department_name_en: "Biological Sciences",
            examtimes: [],
            grade: 0,
            id: 1848419,
            is_english: true,
            limit: 45,
            load: 0,
            num_classes: 3,
            num_labs: 0,
            num_people: 50,
            old_code: "BS120",
            professors: [],
            review_total_weight: 0,
            semester: 3,
            speech: 0,
            title: "일반생물학",
            title_en: "General Biology",
            type: "기초필수",
            type_en: "Basic Required",
            year: 2021
          }],
          reviews: [],
          student_id: "20200104"
        }
        // console.log(response.data);
        store.dispatch(setUser(dumpUser));
      })
      .catch((error) => {
        if (error.response && (error.response.status === 401)) {
          store.dispatch(setUser(null));
        }
      });
  }

  _fetchSemesters = () => {
    axios.get(
      '/api/semesters',
      {
        params: {
          order: ['year', 'semester'],
        },
        metadata: {
          gaCategory: 'Semester',
          gaVariable: 'GET / List',
        },
      },
    )
      .then((response) => {
        store.dispatch(setSemesters(response.data));
      })
      .catch((error) => {
      });
  }

  _updateSizeProperty = () => {
    document.documentElement.style.setProperty('--window-inner-height', `${window.innerHeight}px`);
  }

  _updateIsPortrait = () => {
    store.dispatch(setIsPortrait(this.portraitMediaQuery.matches));
  }

  render() {
    const parseObject = (object) => {
      if (typeof object === 'object') {
        return Object.entries(object)
          .map(([k, v]) => [k, parseObject(v)])
          .reduce((acc, val) => Object.assign({}, acc, { [val[0]]: val[1] }), {});
      }

      if (/^-?[0-9]+$/.test(object)) {
        return parseInt(object, 10);
      }

      const keywords = {
        true: true,
        false: false,
        null: null,
        undefined: undefined,
      };
      if (object in keywords) {
        return keywords[object];
      }

      return object;
    };

    const parseQueryString = (search) => {
      const qsParsed = qs.parse(search, { ignoreQueryPrefix: true });

      return parseObject(qsParsed);
    };

    return (
      <Provider store={store}>
        <>
          <Header />
          <Switch>
            <Route exact path="/" component={MainPage} />
            <Route
              exact
              path="/dictionary"
              render={(props) => (
                props.location.search
                  ? <Redirect to={{ ...props.location, state: { ...props.location.state, ...parseQueryString(props.location.search) }, search: '' }} />
                  : <DictionaryPage {...props} />
              )}
            />
            <Route
              exact
              path="/planner"
              render={(props) => (
                props.location.search
                  ? <Redirect to={{ ...props.location, state: { ...props.location.state, ...parseQueryString(props.location.search) }, search: '' }} />
                  : <PlannerPage {...props} />
              )}
            />
            <Route
              exact
              path="/timetable"
              render={(props) => (
                props.location.search
                  ? <Redirect to={{ ...props.location, state: { ...props.location.state, ...parseQueryString(props.location.search) }, search: '' }} />
                  : <TimetablePage {...props} />
              )}
            />
            <Route
              exact
              path="/timetable/syllabus"
              render={(props) => (
                props.location.search
                  ? <Redirect to={{ ...props.location, state: { ...props.location.state, ...parseQueryString(props.location.search) }, search: '' }} />
                  : <SyllabusPage {...props} />
              )}
            />
            <Route
              exact
              path="/write-reviews"
              render={(props) => (
                props.location.search
                  ? <Redirect to={{ ...props.location, state: { ...props.location.state, ...parseQueryString(props.location.search) }, search: '' }} />
                  : <WriteReviewsPage {...props} />
              )}
            />
            <Route exact path="/account" component={AccountPage} />
            <Route exact path="/credits" component={CreditPage} />
            <Route exact path="/licenses" component={LicensePage} />
            {/* Temporary test page for axiom */}
            <Route exact path="/test" component={TestPage} />
            <Route exact path="/error/:message" component={ErrorPage} />
            <Redirect exact from="/index.html" to="/" />
            {/* Redirection for old url */}
            <Redirect exact from="/main" to="/" />
            {/* TODO: implement 404 page and remove below */}
            <Redirect from="/" to="/" />
          </Switch>
        </>
      </Provider>
    );
  }
}

export default App;

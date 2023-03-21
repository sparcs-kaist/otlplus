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
import PrivacyPage from './pages/PrivacyPage';
import TestPage from './pages/TestPage';
import ErrorPage from './pages/ErrorPage';

import dictionaryReducer from './reducers/dictionary/index';
import timetableReducer from './reducers/timetable/index';
import writeReviewsReducer from './reducers/write-reviews/index';
import commonReducer from './reducers/common/index';
import plannerReducer from './reducers/planner/index';

import { setUser } from './actions/common/user';
import { setSemesters } from './actions/common/semester';
import { setTracks } from './actions/common/track';
import { setIsPortrait } from './actions/common/media';


const store = createStore(combineReducers({
  common: commonReducer,
  dictionary: dictionaryReducer,
  timetable: timetableReducer,
  writeReviews: writeReviewsReducer,
  planner: plannerReducer,
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
        store.dispatch(setUser(response.data));
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

    axios.get(
      '/api/tracks',
      {
        params: {
        },
        metadata: {
          gaCategory: 'Track',
          gaVariable: 'GET / List',
        },
      },
    )
      .then((response) => {
        store.dispatch(setTracks(response.data));
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
            <Route exact path="/privacy" component={PrivacyPage} />
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

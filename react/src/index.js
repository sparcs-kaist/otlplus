/* eslint-disable no-param-reassign, fp/no-mutation, import/first, import/order */


import { createBrowserHistory } from 'history';

const history = createBrowserHistory();


import ReactGA from 'react-ga';

const trackingId = 'UA-144615112-2';
ReactGA.initialize(trackingId);
history.listen((location) => {
  ReactGA.set({ page: location.pathname });
  ReactGA.pageview(location.pathname);
});


import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import moment from 'moment';

import en from './translations/translation.en.json';
import ko from './translations/translation.ko.json';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      ko: {
        translation: ko,
      },
    },
    fallbackLng: ['ko', 'en'],
    debug: false,
    react: {
      useSuspense: false,
    },
    interpolation: {
      escapeValue: false,
      formatSeparator: ',',
      format: (value, formatting, lng) => {
        if (value instanceof Date) {
          return moment(value).locale(lng).format(formatting);
        }
        return value.toString();
      },
    },
  });


import axios from 'axios';
import Qs from 'qs';
import { API_URL } from './const';

axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'csrftoken';

axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

axios.defaults.paramsSerializer = (params) => Qs.stringify(params, { arrayFormat: 'repeat' });

axios.interceptors.request.use(
  (config) => {
    config.metadata = {
      ...config.metadata,
      startTime: new Date(),
    };
    return config;
  },
  // eslint-disable-next-line arrow-body-style
  (error) => {
    return Promise.reject(error);
  },
);

axios.interceptors.response.use(
  (response) => {
    response.config.metadata.endTime = new Date();
    response.config.metadata.duration = (
      response.config.metadata.endTime - response.config.metadata.startTime
    );
    ReactGA.timing({
      category: response.config.metadata.gaCategory || 'Undefined',
      variable: response.config.metadata.gaVariable || 'Undefined',
      value: response.config.metadata.duration,
    });
    return response;
  },
  (error) => {
    error.config.metadata.endTime = new Date();
    error.config.metadata.duration = (
      error.config.metadata.endTime - error.config.metadata.startTime
    );
    return Promise.reject(error);
  },
);


import { Router } from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <Router history={history}>
    <App />
  </Router>,
  document.getElementById('root'),
);


import registerServiceWorker from './registerServiceWorker';

try {
  registerServiceWorker();
}
catch (error) {
  // eslint-disable-next-line no-console
  console.log(error);
}

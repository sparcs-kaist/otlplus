/* eslint-disable */

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import ReactGA from 'react-ga';

const history = createBrowserHistory();

const trackingId = 'UA-144615112-2';
ReactGA.initialize(trackingId);
history.listen(location => {
    ReactGA.set({ page: location.pathname });
    ReactGA.pageview(location.pathname);
});

ReactDOM.render(
    <Router history={history}>
        <App/>
    </Router>,
    document.getElementById('root'));

try {
    registerServiceWorker();
}
catch (error) {
    console.log(error);
}

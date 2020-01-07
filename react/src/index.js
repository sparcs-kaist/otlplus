/* eslint-disable */

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';

ReactDOM.render(
    <Router history={createBrowserHistory()}>
        <App/>
    </Router>,
    document.getElementById('root'));

try {
    registerServiceWorker();
}
catch (error) {
    console.log(error);
}

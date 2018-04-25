import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import { createStore } from 'redux';
import { Provider } from 'react-redux';
import CombinedReducer from './timetable/reducers/index.js';

const store = createStore(CombinedReducer);

ReactDOM.render(
    <Provider store={store}>
        <Router history={createBrowserHistory()}>
            <App/>
        </Router>
    </Provider>,
    document.getElementById('root'));
registerServiceWorker();

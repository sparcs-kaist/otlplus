import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';

ReactDOM.render(
    <Router history={createBrowserHistory()}>
        <App/>
    </Router>,
    document.getElementById('root'));
registerServiceWorker();

import React, { Component } from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import '../static/css/timetable/timetable.css';

import CombinedReducer from './reducers/index.js';

import TimetablePageContent from './TimetablePageContent'


const store = createStore(CombinedReducer);

class TimetablePage extends Component {
    render() {
        return (
            <Provider store={store}>
                <div className="timetable_page">
                    <TimetablePageContent />
                </div>
            </Provider>
        );
    }
}

export default TimetablePage;

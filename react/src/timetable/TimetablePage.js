import React, { Component } from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import '../static/css/timetable/timetable.css';

import CombinedReducer from './reducers/index.js';

import Header from "../common/Header";
import Detail from "./components/Detail";
import List from "./components/List";
import TimetableTabs from "./components/TimetableTabs";
import Semester from "./components/Semester";
import Timetable from "./components/Timetable";
import Map from "./components/Map";
import Summary from "./components/Summary";
import Exam from "./components/Exam";
import Share from "./components/Share";

const store = createStore(CombinedReducer);

class TimetablePage extends Component {
    render() {
        return (
            <Provider store={store}>
                <div className="timetable_page">
                    <Header user={this.props.user}/>
                    <section id="content" className="container-fluid" style={{backgroundColor:"#f9f0f0"}}>
                        <div id="page-container">
                            <div id="left-side">
                                <Detail/>
                                <List/>
                            </div>
                            <div id="center">
                                <div id="timetable-menu">
                                    <TimetableTabs/>
                                    <Semester/>
                                </div>
                                <div id="timetable">
                                    <Timetable/>
                                    <div id="right-side">
                                        <Map/>
                                        <Summary/>
                                        <Exam/>
                                        <Share/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </Provider>
        );
    }
}

export default TimetablePage;

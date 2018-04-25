import React, { Component } from 'react';

import '../static/css/timetable/timetable.css';

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

class TimetablePage extends Component {
    render() {
        return (
            <div>
                <Header/>
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
        );
    }
}

export default TimetablePage;

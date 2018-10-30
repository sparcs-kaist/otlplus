import React, { Component } from 'react';

import '../static/css/timetable/timetable.css';

import TimetablePageContent from './TimetablePageContent'

class TimetablePage extends Component {
    render() {
        return (
            <div className="timetable_page">
                <TimetablePageContent />
            </div>
        );
    }
}

export default TimetablePage;

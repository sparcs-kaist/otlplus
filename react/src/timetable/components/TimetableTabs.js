import React, { Component } from 'react';

class TimetableTabs extends Component {
    render() {
        return (
            <div id="timetable-tabs">
                <div className="timetable-tab" style={{pointerEvents:'none'}}><span className="timetable-num">불러오는 중</span>
                </div>
            </div>
        );
    }
}

export default TimetableTabs;

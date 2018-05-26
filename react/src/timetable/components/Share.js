import React, { Component } from 'react';

class Share extends Component {
    render() {
        return (
            <div id="share-buttons" className="authenticated">
                <div className="left-btn-group">
                  <a className="share-button" id="image" download />
                  <a className="share-button" id="calendar" target="_blank" />
                </div>
                <div className="right-btn-group">
                  <a className="share-button" id="show-timetable-list" />
                  <a className="share-button" id="show-lecture-list" />
                </div>
                <div className="height-placeholder" />
            </div>
        );
    }
}

export default Share;

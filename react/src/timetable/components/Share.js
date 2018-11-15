import React, { Component } from 'react';
import { connect } from "react-redux";
import { mToggleLectureList } from '../actions';
import { modaltimetableList } from '../actions';

class Share extends Component {
    render() {
        return (
            <div id="share-buttons" className="authenticated">
                <div className="left-btn-group">
                  <a className="share-button" id="image" download />
                  <a className="share-button" id="calendar" target="_blank" />
                </div>
                <div className="right-btn-group">
                  <a className="share-button" id="show-timetable-list" onClick={this.props.mtimetableListDispatch } />
                  <a className="share-button" id="show-lecture-list" onClick={this.props.mToggleLectureListDispatch} />
                </div>
                <div className="height-placeholder" />
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => ({
  mToggleLectureListDispatch : () => dispatch(mToggleLectureList()),
  mtimetableListDispatch : () => dispatch(modaltimetableList()),
});

Share = connect(null, mapDispatchToProps)(Share);

export default Share;

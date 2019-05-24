import React, { Component } from 'react';
import { connect } from "react-redux";
import { Link } from 'react-router-dom';
import { mToggleLectureList } from '../actions';
import { modaltimetableList } from '../actions';

class Share extends Component {

  constructor(props){
    super(props);
  }
    render() {
        return (
            <div id="share-buttons" className="authenticated">
                <div className="left-btn-group">
                  <a className="share-button" id="image" download />
                  <a className="share-button" id="calendar" target="_blank" />
                  <a className="share-button" id="calendar" onClick={()=>console.log(this.props.currentTimetable)} />
                  <Link className="share-button" id="image" to={{ pathname: "/timetable/syllabus", state: {lectures: this.props.currentTimetable.lectures} }}  />
                  
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

let mapStateToProps = (state) => {
  return {
      currentTimetable : state.timetable.timetable.currentTimetable,
  }
};

const mapDispatchToProps = (dispatch) => ({
  mToggleLectureListDispatch : () => dispatch(mToggleLectureList()),
  mtimetableListDispatch : () => dispatch(modaltimetableList()),
});

Share = connect(mapStateToProps, mapDispatchToProps)(Share);

export default Share;

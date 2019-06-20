import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { mToggleLectureList, modaltimetableList } from '../../../actions/timetable/index';
import timetableShape from '../../../shapes/TimetableShape';


class ShareSubSection extends Component {
  render() {
    const { currentTimetable, mtimetableListDispatch, mToggleLectureListDispatch } = this.props;

    const timetableLectures = currentTimetable
      ? currentTimetable.lectures
      : [];
    return (
      <div id="share-buttons" className="authenticated">
        <div className="left-btn-group">
          <a className="share-button" id="image" download />
          <a className="share-button" id="calendar" target="_blank" />
          <Link className="share-button" id="image" to={{ pathname: '/timetable/syllabus', state: { lectures: timetableLectures } }} />

        </div>
        <div className="right-btn-group">
          <a className="share-button" id="show-timetable-list" onClick={mtimetableListDispatch} />
          <a className="share-button" id="show-lecture-list" onClick={mToggleLectureListDispatch} />
        </div>
        <div className="height-placeholder" />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  currentTimetable: state.timetable.timetable.currentTimetable,
});

const mapDispatchToProps = dispatch => ({
  mToggleLectureListDispatch: () => dispatch(mToggleLectureList()),
  mtimetableListDispatch: () => dispatch(modaltimetableList()),
});

ShareSubSection.propTypes = {
  currentTimetable: timetableShape,
  mToggleLectureListDispatch: PropTypes.func.isRequired,
  mtimetableListDispatch: PropTypes.func.isRequired,
};


export default connect(mapStateToProps, mapDispatchToProps)(ShareSubSection);

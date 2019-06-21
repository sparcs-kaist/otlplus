import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { timetableBoundClassNames as classNames } from '../../../common/boundClassNames';

import { mToggleLectureList, modaltimetableList } from '../../../actions/timetable/index';
import timetableShape from '../../../shapes/TimetableShape';


class ShareSubSection extends Component {
  render() {
    const { currentTimetable, mtimetableListDispatch, mToggleLectureListDispatch } = this.props;

    const timetableLectures = currentTimetable
      ? currentTimetable.lectures
      : [];
    return (
      <div id={classNames('share-buttons')} className={classNames('authenticated')}>
        <div className={classNames('left-btn-group')}>
          <a className={classNames('share-button')} id={classNames('image')} download />
          <a className={classNames('share-button')} id={classNames('calendar')} target="_blank" />
          <Link className={classNames('share-button')} id={classNames('image')} to={{ pathname: '/timetable/syllabus', state: { lectures: timetableLectures } }} />

        </div>
        <div className={classNames('right-btn-group')}>
          <a className={classNames('share-button')} id={classNames('show-timetable-list')} onClick={mtimetableListDispatch} />
          <a className={classNames('share-button')} id={classNames('show-lecture-list')} onClick={mToggleLectureListDispatch} />
        </div>
        <div className={classNames('height-placeholder')} />
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

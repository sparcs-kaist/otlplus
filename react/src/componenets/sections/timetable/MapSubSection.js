import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import mapImage from '../../../static/img/timetable/kaist_map.jpg';
import { NONE, LIST, TABLE, MULTIPLE } from '../../../reducers/timetable/lectureActive';
import { clearMultipleDetail, setMultipleDetail } from '../../../actions/timetable/index';
import lectureShape from '../../../shapes/LectureShape';
import timetableShape from '../../../shapes/TimetableShape';
import { inTimetable } from '../../../common/lectureFunctions';


class MapSubSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeLectures: [],
    };
  }

  mapFocus(building) {
    const { lectureActiveFrom, currentTimetable, setMultipleDetailDispatch } = this.props;

    if (lectureActiveFrom !== 'NONE' || !currentTimetable) {
      return;
    }

    const active = currentTimetable.lectures.filter(lecture => (
      lecture.building === building
    ));
    const lectures = active.map(lecture => ({
      id: lecture.id,
      title: lecture.title,
      info: lecture.room,
    }));
    setMultipleDetailDispatch(building, lectures);
    this.setState({ activeLectures: active });
  }

  clearFocus() {
    const { lectureActiveFrom, clearMultipleDetailDispatch } = this.props;

    if (lectureActiveFrom !== 'MULTIPLE') {
      return;
    }

    clearMultipleDetailDispatch();
    this.setState({ activeLectures: [] });
  }

  render() {
    const { currentTimetable, lectureActiveLecture } = this.props;

    const timetableLectures = currentTimetable
      ? currentTimetable.lectures
      : [];
    const targetLectures = timetableLectures
      .concat((lectureActiveLecture && !inTimetable(lectureActiveLecture, currentTimetable)) ? [lectureActiveLecture] : []);
    const buildings = new Set(targetLectures.map(lecture => lecture.building));
    const mapObject = Object.assign(
      {},
      ...Array.from(buildings).map(building => (
        {
          [building]: targetLectures
            .filter(lecture => (building === lecture.building))
            .map(lecture => ({ color: (lecture.course % 16), id: lecture.id })),
        }
      )),
    );

    const activeLecture = lectureActiveLecture;
    const { activeLectures } = this.state;

    return (
      <div id="map">
        <div id="map-container">
          <img id="map-img" src={mapImage} alt="KAIST Map" />
          { Object.keys(mapObject).map((building) => {
            const act = mapObject[building].some(lec => (
              (activeLecture !== null && activeLecture.id === lec.id)
              || activeLectures.some(lecture => (lecture.id === lec.id))
            ))
              ? 'active'
              : '';
            const location = (
              <div
                className={`map-location ${building}`}
                key={building}
                data-building={building}
                data-id="1234"
                onMouseOver={() => this.mapFocus(building)}
                onMouseOut={() => this.clearFocus()}
              >
                <div className={`map-location-box ${act}`}>
                  <span className="map-location-text">{building}</span>
                  {mapObject[building].map((lec) => {
                    const lecAct = (activeLecture !== null && activeLecture.id === lec.id) || activeLectures.some(lecture => (lecture.id === lec.id))
                      ? 'active'
                      : '';
                    return <span className={`map-location-circle color${lec.color} ${lecAct}`} key={lec.id} data-id={lec.id} />;
                  })}
                </div>
                <div className="map-location-arrow-shadow" />
                <div className="map-location-arrow" />
              </div>
            );
            return location;
          })}
        </div>
      </div>
    );
  }
}


const mapStateToProps = state => ({
  currentTimetable: state.timetable.timetable.currentTimetable,
  lectureActiveLecture: state.timetable.lectureActive.lecture,
  lectureActiveFrom: state.timetable.lectureActive.from,
});

const mapDispatchToProps = dispatch => ({
  setMultipleDetailDispatch: (title, lectures) => {
    dispatch(setMultipleDetail(title, lectures));
  },
  clearMultipleDetailDispatch: () => {
    dispatch(clearMultipleDetail());
  },
});

MapSubSection.propTypes = {
  currentTimetable: timetableShape,
  lectureActiveLecture: lectureShape,
  lectureActiveFrom: PropTypes.oneOf([NONE, LIST, TABLE, MULTIPLE]).isRequired,
  setMultipleDetailDispatch: PropTypes.func.isRequired,
  clearMultipleDetailDispatch: PropTypes.func.isRequired,
};


export default connect(mapStateToProps, mapDispatchToProps)(MapSubSection);

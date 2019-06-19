import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import mapImage from '../../../static/img/timetable/kaist_map.jpg';
import { NONE, LIST, TABLE, MULTIPLE } from '../../../reducers/timetable/lectureActive';
import { clearMultipleDetail, setMultipleDetail } from '../../../actions/timetable/index';
import lectureShape from '../../../shapes/LectureShape';
import timetableShape from '../../../shapes/TimetableShape';


class MapSubSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeLectures: [],
    };
  }

  mapFocus(building) {
    if (this.props.lectureActiveFrom !== 'NONE') {
      return;
    }

    const active = this.props.currentTimetable.lectures.filter(lecture => (
      lecture.building === building
    ));
    const lectures = active.map(lecture => ({
      title: lecture.title,
      info: lecture.room,
    }));
    this.props.setMultipleDetailDispatch(building, lectures);
    this.setState({ activeLectures: active });
  }

  clearFocus() {
    if (this.props.lectureActiveFrom !== 'MULTIPLE') {
      return;
    }

    this.props.clearMultipleDetailDispatch();
    this.setState({ activeLectures: [] });
  }

  render() {
    const mapObject = {};
    const buildings = new Set(this.props.currentTimetable.lectures.map(lecture => lecture.building));
    buildings.forEach((building) => {
      mapObject[building] = this.props.currentTimetable.lectures
        .filter(lecture => (building === lecture.building))
        .map(lecture => ({ color: (lecture.course % 16), id: lecture.id }));
    });
    const codeList = this.props.currentTimetable.lectures.map(lecture => lecture.code);

    const activeLecture = this.props.lectureActiveLecture;
    if (activeLecture !== null && !codeList.includes(activeLecture.code)) {
      const building = activeLecture.building;
      const color = activeLecture.color;
      const id = activeLecture.id;
      if (mapObject[building] === undefined) {
        mapObject[building] = [{ color: color, id: id }];
      }
      else {
        mapObject[building].push({ color: color, id: id });
      }
    }

    const activeLectures = this.state.activeLectures;

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
  currentTimetable: timetableShape.isRequired,
  lectureActiveLecture: lectureShape,
  lectureActiveFrom: PropTypes.oneOf([NONE, LIST, TABLE, MULTIPLE]).isRequired,
  setMultipleDetailDispatch: PropTypes.func.isRequired,
  clearMultipleDetailDispatch: PropTypes.func.isRequired,
};


export default connect(mapStateToProps, mapDispatchToProps)(MapSubSection);

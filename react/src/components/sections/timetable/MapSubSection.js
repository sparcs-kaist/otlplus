import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import { clearMultipleDetail, setMultipleDetail } from '../../../actions/timetable/lectureFocus';

import { NONE, LIST, TABLE, MULTIPLE } from '../../../reducers/timetable/lectureFocus';

import lectureShape from '../../../shapes/LectureShape';
import timetableShape from '../../../shapes/TimetableShape';

import { inTimetable, isActive, getBuildingStr, getRoomStr } from '../../../common/lectureFunctions';

import mapImage from '../../../static/img/timetable/kaist_map.jpg';


class MapSubSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeLectures: [],
    };
  }

  mapFocus(building) {
    const { t } = this.props;
    const { lectureFocusFrom, currentTimetable, setMultipleDetailDispatch } = this.props;

    if (lectureFocusFrom !== 'NONE' || !currentTimetable) {
      return;
    }

    const active = currentTimetable.lectures.filter(l => (
      getBuildingStr(l) === building
    ));
    const lectures = active.map(l => ({
      id: l.id,
      title: l[t('js.property.title')],
      info: getRoomStr(l),
    }));
    setMultipleDetailDispatch(building, lectures);
    this.setState({ activeLectures: active });
  }

  clearFocus() {
    const { lectureFocusFrom, clearMultipleDetailDispatch } = this.props;

    if (lectureFocusFrom !== 'MULTIPLE') {
      return;
    }

    clearMultipleDetailDispatch();
    this.setState({ activeLectures: [] });
  }

  render() {
    const { currentTimetable, lectureFocusLecture } = this.props;

    const timetableLectures = currentTimetable
      ? currentTimetable.lectures
      : [];
    const targetLectures = timetableLectures
      .concat((lectureFocusLecture && !inTimetable(lectureFocusLecture, currentTimetable))
        ? [lectureFocusLecture]
        : []);
    const buildings = new Set(targetLectures.map(l => getBuildingStr(l)));
    const mapObject = Object.assign(
      {},
      ...Array.from(buildings).map(b => (
        {
          [b]: targetLectures
            .filter(l => (b === getBuildingStr(l)))
            .map(l => ({ color: (l.course % 16) + 1, id: l.id })),
        }
      )),
    );

    const activeLecture = lectureFocusLecture;
    const { activeLectures } = this.state;

    return (
      <div className={classNames('section-content', 'section-content--map', 'mobile-hidden')}>
        <div>
          <img src={mapImage} alt="KAIST Map" />
          { Object.keys(mapObject).map((b) => {
            const act = mapObject[b].some(lec => isActive(lec, activeLecture, activeLectures))
              ? 'block--active'
              : '';
            const location = (
              <div
                className={classNames('section-content--map__block', `location--${b}`)}
                key={b}
                onMouseOver={() => this.mapFocus(b)}
                onMouseOut={() => this.clearFocus()}
              >
                <div className={classNames('section-content--map__block__box', act)}>
                  <span>{b}</span>
                  {mapObject[b].map((l) => {
                    const lecAct = isActive(l, activeLecture, activeLectures)
                      ? 'block--active'
                      : '';
                    return <span className={classNames('background-color--dark', `background-color--${l.color}`, lecAct)} key={l.id} />;
                  })}
                </div>
                <div className={classNames('section-content--map__block__arrow-shadow', act)} />
                <div className={classNames('section-content--map__block__arrow', act)} />
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
  lectureFocusLecture: state.timetable.lectureFocus.lecture,
  lectureFocusFrom: state.timetable.lectureFocus.from,
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
  lectureFocusLecture: lectureShape,
  lectureFocusFrom: PropTypes.oneOf([NONE, LIST, TABLE, MULTIPLE]).isRequired,

  setMultipleDetailDispatch: PropTypes.func.isRequired,
  clearMultipleDetailDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(MapSubSection));

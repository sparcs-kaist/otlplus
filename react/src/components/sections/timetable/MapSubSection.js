import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import { clearMultipleFocus, setMultipleFocus } from '../../../actions/timetable/lectureFocus';

import { NONE, LIST, TABLE, MULTIPLE } from '../../../reducers/timetable/lectureFocus';

import lectureFocusShape from '../../../shapes/LectureFocusShape';
import timetableShape from '../../../shapes/TimetableShape';

import { inTimetable, isFocused, getBuildingStr, getRoomStr } from '../../../common/lectureFunctions';

import mapImage from '../../../static/img/timetable/kaist_map.jpg';


class MapSubSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      multiFocusedLectures: [],
    };
  }

  mapFocus(building) {
    const { t } = this.props;
    const { lectureFocus, selectedTimetable, setMultipleFocusDispatch } = this.props;

    if (lectureFocus.from !== 'NONE' || !selectedTimetable) {
      return;
    }

    const multiFocusedLectures = selectedTimetable.lectures.filter(l => (
      getBuildingStr(l) === building
    ));
    const lectures = multiFocusedLectures.map(l => ({
      id: l.id,
      title: l[t('js.property.title')],
      info: getRoomStr(l),
    }));
    setMultipleFocusDispatch(building, lectures);
    this.setState({ multiFocusedLectures: multiFocusedLectures });
  }

  clearFocus() {
    const { lectureFocus, clearMultipleFocusDispatch } = this.props;

    if (lectureFocus.from !== 'MULTIPLE') {
      return;
    }

    clearMultipleFocusDispatch();
    this.setState({ multiFocusedLectures: [] });
  }

  render() {
    const { selectedTimetable, lectureFocus } = this.props;

    const timetableLectures = selectedTimetable
      ? selectedTimetable.lectures
      : [];
    const targetLectures = timetableLectures
      .concat((lectureFocus.lecture && !inTimetable(lectureFocus.lecture, selectedTimetable))
        ? [lectureFocus.lecture]
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

    const { multiFocusedLectures } = this.state;

    return (
      <div className={classNames('section-content', 'section-content--map', 'mobile-hidden')}>
        <div>
          <img src={mapImage} alt="KAIST Map" />
          { Object.keys(mapObject).map((b) => {
            const act = mapObject[b].some(lec => isFocused(lec, lectureFocus.lecture, multiFocusedLectures))
              ? 'block--focused'
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
                    const lecAct = isFocused(l, lectureFocus.lecture, multiFocusedLectures)
                      ? 'block--focused'
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
  selectedTimetable: state.timetable.timetable.selectedTimetable,
  lectureFocus: state.timetable.lectureFocus,
});

const mapDispatchToProps = dispatch => ({
  setMultipleFocusDispatch: (multipleTitle, multipleDetails) => {
    dispatch(setMultipleFocus(multipleTitle, multipleDetails));
  },
  clearMultipleFocusDispatch: () => {
    dispatch(clearMultipleFocus());
  },
});

MapSubSection.propTypes = {
  selectedTimetable: timetableShape,
  lectureFocus: lectureFocusShape.isRequired,

  setMultipleFocusDispatch: PropTypes.func.isRequired,
  clearMultipleFocusDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(MapSubSection));

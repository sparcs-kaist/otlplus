import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import { clearMultipleFocus, setMultipleFocus } from '../../../actions/timetable/lectureFocus';

import lectureFocusShape from '../../../shapes/LectureFocusShape';
import timetableShape from '../../../shapes/TimetableShape';

import {
  isSingleFocused,
  getBuildingStr, getRoomStr, getColorNumber,
  getOverallLectures,
} from '../../../common/lectureFunctions';

import mapImage from '../../../static/img/timetable/kaist_map.jpg';
import { unique } from '../../../common/utilFunctions';


class MapSubSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      multipleFocusBuilding: null,
    };
  }


  _getLecturesOnBuilding = (building) => {
    const { lectureFocus, selectedTimetable } = this.props;

    return getOverallLectures(selectedTimetable, lectureFocus).filter((l) => (
      getBuildingStr(l) === building
    ));
  }

  setFocusOnMap = (building) => {
    const { t } = this.props;
    const { lectureFocus, selectedTimetable, setMultipleFocusDispatch } = this.props;

    if (lectureFocus.from !== 'NONE' || !selectedTimetable) {
      return;
    }

    const lecturesOnBuilding = this._getLecturesOnBuilding(building);
    const details = lecturesOnBuilding.map((l) => ({
      lecture: l,
      name: l[t('js.property.title')],
      info: getRoomStr(l),
    }));
    setMultipleFocusDispatch(building, details);
    this.setState({
      multipleFocusBuilding: building,
    });
  }

  clearFocus = () => {
    const { lectureFocus, clearMultipleFocusDispatch } = this.props;

    if (lectureFocus.from !== 'MULTIPLE') {
      return;
    }

    clearMultipleFocusDispatch();
    this.setState({
      multipleFocusBuilding: null,
    });
  }

  render() {
    const { multipleFocusBuilding } = this.state;
    const { selectedTimetable, lectureFocus } = this.props;

    const buildings = unique(getOverallLectures(selectedTimetable, lectureFocus).map((l) => getBuildingStr(l)));
    const mapBuildingToBlock = (b) => {
      const lecturesOnBuilding = this._getLecturesOnBuilding(b);
      const act = lecturesOnBuilding.some((l) => isSingleFocused(l, lectureFocus)) || (multipleFocusBuilding === b)
        ? 'block--highlighted'
        : '';
      return (
        <div
          className={classNames('section-content--map__block', `location--${b}`)}
          key={b}
          onMouseOver={() => this.setFocusOnMap(b)}
          onMouseOut={() => this.clearFocus()}
        >
          <div className={classNames('section-content--map__block__box', act)}>
            <span>{b}</span>
            {lecturesOnBuilding.map((l) => {
              const lecAct = isSingleFocused(l, lectureFocus) || (multipleFocusBuilding === b)
                ? 'block--highlighted'
                : '';
              return <span className={classNames('background-color--dark', `background-color--${getColorNumber(l)}`, lecAct)} key={l.id} />;
            })}
          </div>
          <div className={classNames('section-content--map__block__arrow-shadow', act)} />
          <div className={classNames('section-content--map__block__arrow', act)} />
        </div>
      );
    };

    return (
      <div className={classNames('section-content', 'section-content--map', 'mobile-hidden')}>
        <div>
          <img src={mapImage} alt="KAIST Map" />
          { buildings.map((b) => mapBuildingToBlock(b)) }
        </div>
      </div>
    );
  }
}


const mapStateToProps = (state) => ({
  selectedTimetable: state.timetable.timetable.selectedTimetable,
  lectureFocus: state.timetable.lectureFocus,
});

const mapDispatchToProps = (dispatch) => ({
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

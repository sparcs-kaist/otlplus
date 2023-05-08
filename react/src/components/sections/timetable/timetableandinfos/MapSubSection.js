import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import { clearMultipleFocus, setMultipleFocus } from '../../../../actions/timetable/lectureFocus';

import lectureFocusShape from '../../../../shapes/state/timetable/LectureFocusShape';
import timetableShape, { myPseudoTimetableShape } from '../../../../shapes/model/timetable/TimetableShape';

import {
  isSingleFocused,
  getBuildingStr, getRoomStr, getColorNumber,
  getOverallLectures,
} from '../../../../utils/lectureUtils';

import mapImage from '../../../../static/images/timetable/kaist_map.jpg';
import { unique } from '../../../../utils/commonUtils';

import { LectureFocusFrom } from '../../../../reducers/timetable/lectureFocus';


const POSITION_OF_LOCATIONS = new Map([
  ['E2', { left: 60, top: 81 }],
  ['E3', { left: 67, top: 75 }],
  ['E6', { left: 68, top: 63 }],
  ['E6-5', { left: 63, top: 56 }],
  ['E7', { left: 77, top: 61 }],
  ['E11', { left: 53, top: 58 }],
  ['E16', { left: 53, top: 49 }],
  ['N1', { left: 88, top: 39 }],
  ['N3', { left: 53, top: 45 }],
  ['N4', { left: 62, top: 41 }],
  ['N5', { left: 74, top: 39 }],
  ['N7', { left: 33, top: 41 }],
  ['N22', { left: 79, top: 35 }],
  ['N24', { left: 76, top: 31 }],
  ['N25', { left: 59, top: 36 }],
  ['N27', { left: 57, top: 24 }],
  ['W1', { left: 31, top: 84 }],
  ['W8', { left: 35, top: 55 }],
  ['W16', { left: 40, top: 87 }],
]);


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

    if (lectureFocus.from !== LectureFocusFrom.NONE || !selectedTimetable) {
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

    if (lectureFocus.from !== LectureFocusFrom.MULTIPLE) {
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

    const buildings = unique(
      getOverallLectures(selectedTimetable, lectureFocus).map((l) => getBuildingStr(l))
    );
    const mapBuildingToPin = (b) => {
      if (!b) {
        return null;
      }
      const lecturesOnBuilding = this._getLecturesOnBuilding(b);
      const isPinHighlighted = (
        lecturesOnBuilding.some((l) => isSingleFocused(l, lectureFocus))
        || (multipleFocusBuilding === b)
      );
      const position = POSITION_OF_LOCATIONS.get(b) || {};
      return (
        <div
          className={classNames('subsection--map__pin')}
          key={b}
          onMouseOver={() => this.setFocusOnMap(b)}
          onMouseOut={() => this.clearFocus()}
          style={{
            left: `${position.left}%`,
            top: `${position.top}%`,
            zIndex: position.top,
          }}
        >
          <div className={classNames('subsection--map__pin__box', (isPinHighlighted ? 'highlighted' : null))}>
            <span>{b}</span>
            {lecturesOnBuilding.map((l) => {
              const isCircleHighlighted = (
                isSingleFocused(l, lectureFocus) || (multipleFocusBuilding === b)
              );
              return (
                <span
                  className={classNames(
                    'background-color--dark',
                    `background-color--${getColorNumber(l)}`,
                    (isCircleHighlighted ? 'highlighted' : null)
                  )}
                  key={l.id}
                />
              );
            })}
          </div>
          <div className={classNames('subsection--map__pin__arrow-shadow', (isPinHighlighted ? 'highlighted' : null))} />
          <div className={classNames('subsection--map__pin__arrow', (isPinHighlighted ? 'highlighted' : null))} />
        </div>
      );
    };

    return (
      <div className={classNames('subsection', 'subsection--map', 'mobile-hidden')}>
        <div>
          <img src={mapImage} alt="KAIST Map" />
          { buildings.map((b) => mapBuildingToPin(b)) }
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
  selectedTimetable: PropTypes.oneOfType([timetableShape, myPseudoTimetableShape]),
  lectureFocus: lectureFocusShape.isRequired,

  setMultipleFocusDispatch: PropTypes.func.isRequired,
  clearMultipleFocusDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    MapSubSection
  )
);

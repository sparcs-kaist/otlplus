import React, { Component } from 'react';

import mapImage from '../../static/img/timetable/kaist_map.jpg';
import {clearMultipleDetail, setMultipleDetail} from "../actions";
import {connect} from "react-redux";


class Map extends Component {
    render() {
        // console.log(this.props.currentTimetable)
        //
        // for (let i=0, lecture; lecture = this.props.currentTimetable[i]; i++) {
        //     let building = lecture.building;
        //     console.log(building)
        // }

        return (
            <div id="map">
                <div id="map-container">
                    <img id="map-img" src={mapImage} alt="KAIST Map"/>
                    {/*<div className="map-location E2" data-building="E2" data-id="1234">*/}
                        {/*<div className="map-location-box">*/}
                            {/*<span className="map-location-text">E2</span>*/}
                        {/*</div>*/}
                        {/*<div className="map-location-arrow-shadow"></div>*/}
                        {/*<div className="map-location-arrow"></div>*/}
                    {/*</div>*/}
                </div>
            </div>
        );
    }
}


let mapStateToProps = (state) => {
    return {
        currentTimetable : state.timetable.currentTimetable,
        lectureActiveLecture : state.lectureActive.lecture,
        lectureActiveFrom : state.lectureActive.from,
    }
};

let mapDispatchToProps = (dispatch) => {
    return {
        setMultipleDetailDispatch : (title, lectures) => {
            dispatch(setMultipleDetail(title, lectures));
        },
        clearMultipleDetailDispatch : () => {
            dispatch(clearMultipleDetail());
        },
    }
};

Map = connect(mapStateToProps, mapDispatchToProps)(Map);


export default Map;

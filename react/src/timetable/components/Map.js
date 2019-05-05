import React, { Component } from 'react';

import mapImage from '../../static/img/timetable/kaist_map.jpg';
import {clearMultipleDetail, setMultipleDetail} from "../actions";
import {connect} from "react-redux";


class Map extends Component {

    constructor(props) {
        super(props);

        this.state = {
            activeLectures: []
        }
    }

    mapFocus(building) {
        if (this.props.lectureActiveFrom !== "NONE")
            return;

        let lectures = [];
        let active = [];
        for (let i=0, lecture; lecture = this.props.currentTimetable.lectures[i]; i++) {
            if (lecture.building === building) {
                lectures.push({
                    title: lecture.title,
                    info: lecture.room,
                })
                active.push(lecture)
            }
        }
        this.props.setMultipleDetailDispatch(building, lectures);
        this.setState({ activeLectures: active })
    }

    clearFocus() {
        if (this.props.lectureActiveFrom !== "MULTIPLE")
            return;

        this.props.clearMultipleDetailDispatch();
        this.setState({ activeLectures: [] })
    }

    render() {
        let mapObject = {};
        let codeList = [];

        for (let i=0, lecture; (lecture = this.props.currentTimetable.lectures[i]); i++) {
            let building = lecture.building;
            let color = lecture.course%16;
            let id = lecture.id;
            mapObject[building]===undefined?
                mapObject[building] = [{color: color, id: id}]
                : mapObject[building].push({color: color, id: id})
            codeList.push(lecture.code)
        }

        let activeLecture = this.props.lectureActiveLecture;
        if (activeLecture !== null && !codeList.includes(activeLecture.code)) {
            let building = activeLecture.building
            let color = activeLecture.color
            let id = activeLecture.id
            mapObject[building]===undefined?
                mapObject[building] = [{color: color, id: id}]
                : mapObject[building].push({color: color, id: id})
        }

        const mapFocus = (building) => {
            let lectures = [];
            let active = [];
            for (let i=0, lecture; lecture = this.props.currentTimetable.lectures[i]; i++) {
                if (lecture.building === building) {
                    lectures.push({
                        title: lecture.title,
                        info: lecture.room,
                    })
                    active.push(lecture)
                }
            }
            this.props.setMultipleDetailDispatch(building, lectures);
            this.setState({ activeLectures: active })
        }

        const clearFocus = () => {
            this.props.clearMultipleDetailDispatch();
            this.setState({ activeLectures: [] })
        };

        let activeLectures = this.state.activeLectures

        return (
            <div id="map">
                <div id="map-container">
                    <img id="map-img" src={mapImage} alt="KAIST Map"/>
                        {Object.keys(mapObject).map((building) => {
                            let act = "";
                            mapObject[building].map(function(lec) {
                                if (activeLecture!==null && activeLecture.id===lec.id)
                                    act = "active";
                                for (let i=0, lecture; lecture = activeLectures[i]; i++) {
                                    if (lecture.id === lec.id) act = "active";
                                }
                                return null;
                            })
                            let location =
                                <div className={`map-location ${building}`} data-building={building} data-id="1234"
                                     onMouseOver={()=>this.mapFocus(building)} onMouseOut={()=>this.clearFocus()}>
                                    <div className={`map-location-box ${act}`}>
                                        <span className="map-location-text">{building}</span>
                                        {mapObject[building].map(function(lec) {
                                            let lecAct = ""
                                            for (let i=0, lecture; lecture = activeLectures[i]; i++) {
                                                if (lecture.id === lec.id) lecAct = "active"
                                            }
                                            if (activeLecture!==null && activeLecture.id===lec.id) lecAct = "active"
                                            return <span className={`map-location-circle color${lec.color} ${lecAct}`} data-id={lec.id}></span>
                                        })}
                                    </div>
                                    <div className="map-location-arrow-shadow"></div>
                                    <div className="map-location-arrow"></div>
                                </div>
                            return location
                        })}
                </div>
            </div>
        );
    }
}


let mapStateToProps = (state) => {
    return {
        currentTimetable : state.timetable.timetable.currentTimetable,
        lectureActiveLecture : state.timetable.lectureActive.lecture,
        lectureActiveFrom : state.timetable.lectureActive.from,
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

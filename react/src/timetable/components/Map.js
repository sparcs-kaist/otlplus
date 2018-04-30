import React, { Component } from 'react';

import mapImage from '../../static/img/timetable/kaist_map.jpg';


class Map extends Component {
    render() {
        return (
            <div id="map">
                <div id="map-container">
                    <img id="map-img" src={mapImage} alt="KAIST Map"/>
                </div>
            </div>
        );
    }
}

export default Map;

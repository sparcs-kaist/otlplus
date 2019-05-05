import React, {Component} from 'react';
import axios from "./common/presetAxios";


class TestPage extends Component {
    componentDidMount() {
        axios.post("/api/timetable/list_load_humanity", {
            year: 2018,
            semester: 1,
        })
        .then((response) => {
            console.log(response.data);
        })
        .catch((response) => {
            console.log(response);
        });
        axios.post("/api/main/academic_schedule_load/", {
            year: 2018,
            semester: 3,
        })
        .then((response) => {
            console.log("not error");
            console.log(response.data);
        })
        .catch((response) => {
            console.log('error');
            console.log(response);
        });
        axios.post("/api/main/did_you_know", {
        })
        .then((response) => {
            console.log("not error");
            console.log(response.data);
        })
        .catch((response) => {
            console.log('error');
            console.log(response);
        });

    }


    render() {
        return (
            <div/>
        );
    }
}

export default TestPage;

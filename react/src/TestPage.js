import React, {Component} from 'react';
import axios from "./common/presetAxios";


class TestPage extends Component {
    componentDidMount() {
        axios.post("/read", {
            id: 70
        })
        .then((response) => {
            console.log(response.body.time);
        })
        .catch((response) => {
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

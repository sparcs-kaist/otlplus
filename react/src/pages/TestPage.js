/* eslint no-console: "off" */

import React, { Component } from 'react';

import axios from '../common/presetAxios';
import { BASE_URL } from '../common/constants';


class TestPage extends Component {
  componentDidMount() {
    axios.post(`${BASE_URL}/read`, {
      id: 70,
    })
      .then((response) => {
        console.log(response.body.time);
      })
      .catch((response) => {
        console.log(response);
      });
    axios.post(`${BASE_URL}/api/main/academic_schedule_load/`, {
      year: 2018,
      semester: 3,
    })
      .then((response) => {
        console.log('not error');
        console.log(response.data);
      })
      .catch((response) => {
        console.log('error');
        console.log(response);
      });
    axios.post(`${BASE_URL}/api/main/did_you_know`, {
    })
      .then((response) => {
        console.log('not error');
        console.log(response.data);
      })
      .catch((response) => {
        console.log('error');
        console.log(response);
      });
  }


  render() {
    return (
      <div />
    );
  }
}

export default TestPage;

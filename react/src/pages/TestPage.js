/* eslint no-console: "off" */

import React, { Component } from 'react';

import axios from '../common/presetAxios';
import { BASE_URL } from '../common/constants';


class TestPage extends Component {
  componentDidMount() {
    axios.get(`${BASE_URL}/api/feeds`, { params: {
      date: new Date().toJSON().slice(0, 10),
    } })
      .then((response) => {
        console.log(response.data);
      })
      .catch((response) => {
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

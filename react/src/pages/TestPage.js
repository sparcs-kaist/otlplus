/* eslint no-console: "off" */

import React, { Component } from 'react';

import axios from '../common/presetAxios';


class TestPage extends Component {
  componentDidMount() {
    axios.get(
      '/api/feeds',
      {
        params: {
          date: new Date().toJSON().slice(0, 10),
        },
      },
    )
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }


  render() {
    return (
      <div />
    );
  }
}

export default TestPage;

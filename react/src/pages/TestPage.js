import React, { Component } from 'react';
import axios from '../presetAxios';


class TestPage extends Component {
  componentDidMount() {
    axios.post('/read', {
      id: 70,
    })
      .then((response) => {
        console.log(response.body.time);
      })
      .catch((response) => {
        console.log(response);
      });
    axios.post('/api/main/academic_schedule_load/', {
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
    axios.post('/api/main/did_you_know', {
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

import React, { Component } from 'react';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import axios from '../../../common/presetAxios';
import { BASE_URL } from '../../../common/constants';
import CurrentTimetableBlock from '../../blocks/CurrentTimetableBlock';


class CurrentTimetableSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lectures: [],
      cellWidth: 0,
    };
  }

  componentDidMount() {
    this.resize();
    window.addEventListener('resize', this.resize);

    axios.post(`${BASE_URL}/api/timetable/table_load`, {
      year: 2018,
      semester: 3,
    })
      .then((response) => {
        this.setState({
          lectures: (response.data && response.data.length > 1) ? response.data[1].lectures : [],
        });
      })
      .catch((response) => {
      });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  resize = () => {
    const cell = document.getElementsByClassName(classNames('hcell-left'))[0].getBoundingClientRect();
    this.setState({
      cellWidth: cell.width,
    });
  }

  render() {
    const { lectures, cellWidth } = this.state;

    const today = new Date();
    const day = today.getDay();
    const hours = today.getHours();
    const minutes = today.getMinutes();

    return (
      <div className={classNames('section-content', 'section-content--widget', 'section-content--current-timetable')}>
        <div
          style={{
            left: -((hours + (minutes / 60) - 8) * cellWidth * 2 + 2 - 2) + 58,
          }}
        >
          <div className={classNames('section-content--current-timetable__table')}>
            <div>
              {
                [...Array((24 - 8) * 2).keys()].map((i) => {
                  if (i % 2 === 0) {
                    const hour = (i / 2) + 8;
                    const hourValue = ((hour - 1) % 12) + 1;
                    if (hour % 6 === 0) {
                      return <div><strong>{hourValue}</strong></div>;
                    }
                    return <div><span>{hourValue}</span></div>;
                  }
                  if (i === (24 - 8) * 2 - 1) {
                    return <div><strong>12</strong></div>;
                  }
                  return <div />;
                })
              }
            </div>
            <div>
              {
                [...Array((24 - 8) * 2).keys()].map((i) => {
                  if (i % 2 === 0) {
                    const hour = (i / 2) + 8;
                    if (hour % 6 === 0) {
                      return <div className={classNames('hcell-left', 'hcell-bold')} />;
                    }
                    return <div className={classNames('hcell-left')} />;
                  }
                  if (i === (24 - 8) * 2 - 1) {
                    return <div className={classNames('hcell-right', 'hcell-last')} />;
                  }
                  return <div className={classNames('hcell-right')} />;
                })
              }
            </div>
          </div>
          {
            lectures.map(lecture => (
              lecture.classtimes
                .filter(classtime => (classtime.day === day - 1))
                .map(classtime => (
                  <CurrentTimetableBlock
                    key={`${lecture.id}:${classtime.day}:${classtime.begin}`}
                    lecture={lecture}
                    classtime={classtime}
                    cellWidth={cellWidth}
                    cellHeight={51}
                  />
                ))
            ))
          }
          <div
            className={classNames('section-content--current-timetable__bar')}
            style={{
              top: 11 + 4 - 2,
              left: (hours + (minutes / 60) - 8) * cellWidth * 2 + 2 - 2,
            }}
          >
            <div />
            <div />
          </div>
        </div>
        <div className={classNames('buttons')}>
          <button className={classNames('text-button')}>
            자세히 보기
          </button>
        </div>
      </div>
    );
  }
}


export default CurrentTimetableSection;

import React, { Component } from 'react';

class TimetableBlock extends Component {
  render() {
    const indexOfTime = time => (time / 30 - 16);

    let activeType = '';
    if (this.props.isClicked) {
      activeType = ' click';
    }
    else if (this.props.isHover) {
      activeType = ' active';
    }
    else if (this.props.isTemp) {
      activeType = ' lecture-block-temp active';
    }

    return (
      <div
        className={`lecture-block color${this.props.lecture.course % 16}${activeType}`}
        style={{
          left: (this.props.cellWidth + 6) * this.props.classtime.day + 28,
          top: this.props.cellHeight * indexOfTime(this.props.classtime.begin) + 28,
          width: this.props.cellWidth + 2,
          height: this.props.cellHeight * (indexOfTime(this.props.classtime.end) - indexOfTime(this.props.classtime.begin)) - 3,
        }}
        onMouseOver={() => this.props.blockHover(this.props.lecture)()}
        onMouseOut={() => this.props.blockOut()}
        onClick={() => this.props.blockClick(this.props.lecture)()}
      >
        <div className="lecture-delete" onClick={event => this.props.deleteLecture(this.props.lecture)(event)}><i /></div>
        <div
          // onMouseDown={() => this.props.onMouseDown()}
          className="lecture-block-content"
        >
          <p className="timetable-lecture-name">
            {this.props.lecture.title}
          </p>
          <p className="timetable-lecture-info">
            {this.props.lecture.professor}
          </p>
          <p className="timetable-lecture-info">
            {this.props.classtime.classroom}
          </p>
        </div>
      </div>
    );
  }
}

export default TimetableBlock;

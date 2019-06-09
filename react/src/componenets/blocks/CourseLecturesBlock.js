import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from '../../presetAxios';
import { addLectureToTimetable, addLectureToCart, deleteLectureFromCart, setLectureActive, clearLectureActive } from '../../actions/timetable/index';
import { LIST } from '../../reducers/timetable/lectureActive';

class CourseLecturesBlock extends Component {
  _isClicked = lecture => (
    this.props.lectureActiveFrom === LIST
    && this.props.lectureActiveClicked === true
    && this.props.activeLecture.id === lecture.id
  )

  _isHover = lecture => (
    this.props.lectureActiveFrom === LIST
    && this.props.lectureActiveClicked === false
    && this.props.activeLecture.id === lecture.id
  )


  addToTable = lecture => (event) => {
    event.stopPropagation();
    for (let i = 0, thisClasstime; (thisClasstime = lecture.classtimes[i]); i++) {
      for (let j = 0, lecture; (lecture = this.props.currentTimetable.lectures[j]); j++) {
        for (let k = 0, classtime; (classtime = lecture.classtimes[k]); k++) {
          if ((classtime.begin < thisClasstime.end) && (classtime.end > thisClasstime.begin)) {
            alert(false ? "You can't add lecture overlapping." : '시간표가 겹치는 과목은 추가할 수 없습니다.');
            return;
          }
        }
      }
    }

    axios.post('/api/timetable/table_update', {
      table_id: this.props.currentTimetable.id,
      lecture_id: lecture.id,
      delete: false,
    })
      .then((response) => {
        this.props.addLectureToTimetableDispatch(lecture);
      })
      .catch((response) => {
        console.log(response);
      });
  }

  addToCart = lecture => (event) => {
    event.stopPropagation();
    axios.post('/api/timetable/wishlist_update', {
      lecture_id: lecture.id,
      delete: false,
    })
      .then((response) => {
        this.props.addLectureToCartDispatch(lecture);
      })
      .catch((response) => {
        console.log(response);
      });
  }

  deleteFromCart = lecture => (event) => {
    event.stopPropagation();
    axios.post('/api/timetable/wishlist_update', {
      lecture_id: lecture.id,
      delete: true,
    })
      .then((response) => {
        this.props.deleteLectureFromCartDispatch(lecture);
      })
      .catch((response) => {
        console.log(response);
      });
  }

  listHover = lecture => () => {
    if (this.props.lectureActiveClicked) {
      return;
    }
    this.props.setLectureActiveDispatch(lecture, LIST, false);
  }

  listOut = () => {
    if (this.props.lectureActiveClicked) {
      return;
    }
    this.props.clearLectureActiveDispatch();
  }

  listClick = lecture => () => {
    if (!this._isClicked(lecture)) {
      this.props.setLectureActiveDispatch(lecture, 'LIST', true);
    }
    else {
      this.props.setLectureActiveDispatch(lecture, 'LIST', false);
    }
  }


  render() {
    const getClass = (lecture) => {
      switch (lecture.class_title.length) {
        case 1:
          return 'class-title fixed-1';
        case 2:
          return 'class-title fixed-2';
        default:
          return 'class-title';
      }
    };
    const change = this._isClicked(this.props.lecture) || this._isHover(this.props.lecture) ? 'click' : '';
    return (
      <div className={`list-elem-body-wrap ${change}`} onClick={() => this.listClick(this.props.lecture)()} onMouseOver={() => this.listHover(this.props.lecture)()} onMouseOut={() => this.listOut()}>
        <div className="list-elem-body">
          <div className="list-elem-body-text">
            <strong className={getClass(this.props.lecture)}>{this.props.lecture.class_title}</strong>
            &nbsp;
            <span className="class-prof">{this.props.lecture.professor_short}</span>
          </div>
          {
            this.props.fromCart
              ? <div className="delete-from-cart" onClick={event => this.deleteFromCart(this.props.lecture)(event)}><i /></div>
              : (
                !this.props.inCart
                  ? <div className="add-to-cart" onClick={event => this.addToCart(this.props.lecture)(event)}><i /></div>
                  : <div className="add-to-cart disable"><i /></div>
              )
          }
          {
            !this.props.inTimetable
              ? <div className="add-to-table" onClick={event => this.addToTable(this.props.lecture)(event)}><i /></div>
              : <div className="add-to-table disable"><i /></div>
          }
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  currentTimetable: state.timetable.timetable.currentTimetable,
  lectureActiveFrom: state.timetable.lectureActive.from,
  lectureActiveClicked: state.timetable.lectureActive.clicked,
  activeLecture: state.timetable.lectureActive.lecture,
});

const mapDispatchToProps = dispatch => ({
  addLectureToTimetableDispatch: (lecture) => {
    dispatch(addLectureToTimetable(lecture));
  },
  setLectureActiveDispatch: (lecture, from, clicked) => {
    dispatch(setLectureActive(lecture, from, clicked));
  },
  clearLectureActiveDispatch: () => {
    dispatch(clearLectureActive());
  },
  addLectureToCartDispatch: (lecture) => {
    dispatch(addLectureToCart(lecture));
  },
  deleteLectureFromCartDispatch: (lecture) => {
    dispatch(deleteLectureFromCart(lecture));
  },
});

CourseLecturesBlock = connect(mapStateToProps, mapDispatchToProps)(CourseLecturesBlock);

export default CourseLecturesBlock;

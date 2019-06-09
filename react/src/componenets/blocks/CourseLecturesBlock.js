import React, { Component } from 'react';

class CourseLecturesBlock extends Component {
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
    const change = this.props.isClicked || this.props.isHover ? 'click' : '';
    return (
      <div className={`list-elem-body-wrap ${change}`} onClick={() => this.props.listClick(this.props.lecture)()} onMouseOver={() => this.props.listHover(this.props.lecture)()} onMouseOut={() => this.props.listOut()}>
        <div className="list-elem-body">
          <div className="list-elem-body-text">
            <strong className={getClass(this.props.lecture)}>{this.props.lecture.class_title}</strong>
            &nbsp;
            <span className="class-prof">{this.props.lecture.professor_short}</span>
          </div>
          {
            this.props.fromCart
              ? <div className="delete-from-cart" onClick={event => this.props.deleteFromCart(this.props.lecture)(event)}><i /></div>
              : (
                !this.props.inCart
                  ? <div className="add-to-cart" onClick={event => this.props.addToCart(this.props.lecture)(event)}><i /></div>
                  : <div className="add-to-cart disable"><i /></div>
              )
          }
          {
            !this.props.inTimetable
              ? <div className="add-to-table" onClick={event => this.props.addToTable(this.props.lecture)(event)}><i /></div>
              : <div className="add-to-table disable"><i /></div>
          }
        </div>
      </div>
    );
  }
}

export default CourseLecturesBlock;

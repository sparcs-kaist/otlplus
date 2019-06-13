import React from 'react';
import PropTypes from 'prop-types';
import { pure } from 'recompose';

import lectureShape from '../../shapes/lectureShape';


const CourseLecturesBlock = (props) => {
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
  const change = props.isClicked || props.isHover ? 'click' : '';
  return (
      // eslint-disable-next-line react/jsx-indent
      <div className={`list-elem-body-wrap ${change}`} onClick={() => props.listClick(props.lecture)()} onMouseOver={() => props.listHover(props.lecture)()} onMouseOut={() => props.listOut()}>
        <div className="list-elem-body">
          <div className="list-elem-body-text">
            <strong className={getClass(props.lecture)}>{props.lecture.class_title}</strong>
            &nbsp;
            <span className="class-prof">{props.lecture.professor_short}</span>
          </div>
          {
            props.fromCart
              ? <div className="delete-from-cart" onClick={event => props.deleteFromCart(props.lecture)(event)}><i /></div>
              : (
                !props.inCart
                  ? <div className="add-to-cart" onClick={event => props.addToCart(props.lecture)(event)}><i /></div>
                  : <div className="add-to-cart disable"><i /></div>
              )
          }
          {
            !props.inTimetable
              ? <div className="add-to-table" onClick={event => props.addToTable(props.lecture)(event)}><i /></div>
              : <div className="add-to-table disable"><i /></div>
          }
        </div>
      </div>
  );
};

CourseLecturesBlock.propTypes = {
  lecture: lectureShape.isRequired,
  isClicked: PropTypes.bool.isRequired,
  isHover: PropTypes.bool.isRequired,
  inTimetable: PropTypes.bool.isRequired,
  inCart: PropTypes.bool.isRequired,
  fromCart: PropTypes.bool.isRequired,
  addToCart: PropTypes.func.isRequired,
  addToTable: PropTypes.func.isRequired,
  deleteFromCart: PropTypes.func.isRequired,
  listHover: PropTypes.func.isRequired,
  listOut: PropTypes.func.isRequired,
  listClick: PropTypes.func.isRequired,
};

export default pure(CourseLecturesBlock);

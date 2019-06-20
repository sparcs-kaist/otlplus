import React from 'react';
import PropTypes from 'prop-types';
import { pure } from 'recompose';

import lectureShape from '../../shapes/LectureShape';


const CourseLecturesBlock = ({ lecture, isClicked, isHover, inTimetable, inCart, fromCart, addToCart, addToTable, deleteFromCart, listHover, listOut, listClick }) => {
  const getClass = (lec) => {
    switch (lec.class_title.length) {
      case 1:
        return 'class-title fixed-1';
      case 2:
        return 'class-title fixed-2';
      default:
        return 'class-title';
    }
  };
  const change = isClicked || isHover ? 'click' : '';
  return (
      // eslint-disable-next-line react/jsx-indent
      <div className={`list-elem-body-wrap ${change}`} onClick={() => listClick(lecture)()} onMouseOver={() => listHover(lecture)()} onMouseOut={() => listOut()}>
        <div className="list-elem-body">
          <div className="list-elem-body-text">
            <strong className={getClass(lecture)}>{lecture.class_title}</strong>
            &nbsp;
            <span className="class-prof">{lecture.professor_short}</span>
          </div>
          {
            fromCart
              ? <div className="delete-from-cart" onClick={event => deleteFromCart(lecture)(event)}><i /></div>
              : (
                !inCart
                  ? <div className="add-to-cart" onClick={event => addToCart(lecture)(event)}><i /></div>
                  : <div className="add-to-cart disable"><i /></div>
              )
          }
          {
            !inTimetable
              ? <div className="add-to-table" onClick={event => addToTable(lecture)(event)}><i /></div>
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

import React from 'react';
import PropTypes from 'prop-types';
import { pure } from 'recompose';

import { timetableBoundClassNames as classNames } from '../../common/boundClassNames';

import lectureShape from '../../shapes/LectureShape';


const CourseLecturesBlock = ({ lecture, isClicked, isHover, inTimetable, inCart, fromCart, addToCart, addToTable, deleteFromCart, listHover, listOut, listClick }) => {
  const getClass = (lec) => {
    switch (lec.class_title.length) {
      case 1:
        return classNames('class-title', 'fixed-1');
      case 2:
        return classNames('class-title', 'fixed-2');
      default:
        return classNames('class-title');
    }
  };
  const change = isClicked || isHover ? classNames('click') : '';
  return (
      // eslint-disable-next-line react/jsx-indent
      <div className={classNames('list-elem-body-wrap', change)} onClick={() => listClick(lecture)()} onMouseOver={() => listHover(lecture)()} onMouseOut={() => listOut()}>
        <div className={classNames('list-elem-body')}>
          <div className={classNames('list-elem-body-text')}>
            <strong className={getClass(lecture)}>{lecture.class_title}</strong>
            &nbsp;
            <span className={classNames('class-prof')}>{lecture.professor_short}</span>
          </div>
          {
            fromCart
              ? <div className={classNames('delete-from-cart')} onClick={event => deleteFromCart(lecture)(event)}><i /></div>
              : (
                !inCart
                  ? <div className={classNames('add-to-cart')} onClick={event => addToCart(lecture)(event)}><i /></div>
                  : <div className={classNames('add-to-cart', 'disable')}><i /></div>
              )
          }
          {
            !inTimetable
              ? <div className={classNames('add-to-table')} onClick={event => addToTable(lecture)(event)}><i /></div>
              : <div className={classNames('add-to-table', 'disable')}><i /></div>
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

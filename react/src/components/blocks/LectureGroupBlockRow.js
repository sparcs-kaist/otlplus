import React from 'react';
import PropTypes from 'prop-types';
import { pure } from 'recompose';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import { getProfessorsStrShort } from '../../common/lectureFunctions';

import lectureShape from '../../shapes/LectureShape';


const LectureGroupBlockRow = ({
  t,
  lecture,
  isClicked, isHover, inTimetable, isTimetableReadonly, inCart, fromCart,
  addToCart, addToTable, deleteFromCart,
  listHover, listOut, listClick,
}) => {
  const getClass = (lec) => {
    switch (lec.class_title.length) {
      case 1:
        return classNames('block--lecture-group__elem__texts__fixed-1');
      case 2:
        return classNames('block--lecture-group__elem__texts__fixed-2');
      default:
        return classNames('');
    }
  };
  const change = isClicked ? classNames('block--clicked') : (isHover ? classNames('block--active') : '');
  return (
    <div className={classNames('block--lecture-group__elem-wrap', change)} data-id={lecture.id} onClick={() => listClick(lecture)()} onMouseOver={() => listHover(lecture)()} onMouseOut={() => listOut()}>
      <div className={classNames('block--lecture-group__elem')}>
        <div className={classNames('block--lecture-group__elem__texts')}>
          <strong className={getClass(lecture)}>{lecture[t('js.property.class_title')]}</strong>
          {' '}
          <span>{getProfessorsStrShort(lecture)}</span>
        </div>
        {
          fromCart
            ? <button className={classNames('block--lecture-group__elem__button')} onClick={event => deleteFromCart(lecture)(event)}><i className={classNames('icon', 'icon--delete-cart')} /></button>
            : (
              !inCart
                ? <button className={classNames('block--lecture-group__elem__button')} onClick={event => addToCart(lecture)(event)}><i className={classNames('icon', 'icon--add-cart')} /></button>
                : <button className={classNames('block--lecture-group__elem__button', 'block--lecture-group__elem__button--disable')}><i className={classNames('icon', 'icon--add-cart')} /></button>
            )
        }
        {
          !inTimetable && !isTimetableReadonly
            ? <button className={classNames('block--lecture-group__elem__button')} onClick={event => addToTable(lecture)(event)}><i className={classNames('icon', 'icon--add-lecture')} /></button>
            : <button className={classNames('block--lecture-group__elem__button', 'block--lecture-group__elem__button--disable')}><i className={classNames('icon', 'icon--add-lecture')} /></button>
        }
      </div>
    </div>
  );
};

LectureGroupBlockRow.propTypes = {
  lecture: lectureShape.isRequired,
  isClicked: PropTypes.bool.isRequired,
  isHover: PropTypes.bool.isRequired,
  inTimetable: PropTypes.bool.isRequired,
  isTimetableReadonly: PropTypes.bool.isRequired,
  inCart: PropTypes.bool.isRequired,
  fromCart: PropTypes.bool.isRequired,
  addToCart: PropTypes.func.isRequired,
  addToTable: PropTypes.func.isRequired,
  deleteFromCart: PropTypes.func.isRequired,
  listHover: PropTypes.func.isRequired,
  listOut: PropTypes.func.isRequired,
  listClick: PropTypes.func.isRequired,
};

export default withTranslation()(pure(LectureGroupBlockRow));
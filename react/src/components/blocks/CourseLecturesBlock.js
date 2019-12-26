import React from 'react';
import PropTypes from 'prop-types';
import { pure } from 'recompose';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';

import lectureShape from '../../shapes/LectureShape';


const CourseLecturesBlock = ({ t, lecture, isClicked, isHover, inTimetable, inCart, fromCart, addToCart, addToTable, deleteFromCart, listHover, listOut, listClick }) => {
  const getClass = (lec) => {
    switch (lec.class_title.length) {
      case 1:
        return classNames('block--course-lectures__elem__texts__fixed-1');
      case 2:
        return classNames('block--course-lectures__elem__texts__fixed-2');
      default:
        return classNames('');
    }
  };
  const change = isClicked ? classNames('block--clicked') : (isHover ? classNames('block--active') : '');
  return (
    <div className={classNames('block--course-lectures__elem-wrap', change)} data-id={lecture.id} onClick={() => listClick(lecture)()} onMouseOver={() => listHover(lecture)()} onMouseOut={() => listOut()}>
      <div className={classNames('block--course-lectures__elem')}>
        <div className={classNames('block--course-lectures__elem__texts')}>
          <strong className={getClass(lecture)}>{lecture[t('js.property.class_title')]}</strong>
          {' '}
          <span>{lecture[t('js.property.professor_short')]}</span>
        </div>
        {
          fromCart
            ? <div className={classNames('block--course-lectures__elem__button')} onClick={event => deleteFromCart(lecture)(event)}><i className={classNames('icon', 'icon--delete-cart')} /></div>
            : (
              !inCart
                ? <div className={classNames('block--course-lectures__elem__button')} onClick={event => addToCart(lecture)(event)}><i className={classNames('icon', 'icon--add-cart')} /></div>
                : <div className={classNames('block--course-lectures__elem__button', 'block--course-lectures__elem__button--disable')}><i className={classNames('icon', 'icon--add-cart')} /></div>
            )
        }
        {
          !inTimetable
            ? <div className={classNames('block--course-lectures__elem__button')} onClick={event => addToTable(lecture)(event)}><i className={classNames('icon', 'icon--add-lecture')} /></div>
            : <div className={classNames('block--course-lectures__elem__button', 'block--course-lectures__elem__button--disable')}><i className={classNames('icon', 'icon--add-lecture')} /></div>
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

export default withTranslation()(pure(CourseLecturesBlock));

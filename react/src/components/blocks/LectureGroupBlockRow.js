import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import { getProfessorsShortStr, getClassroomStr } from '../../common/lectureFunctions';

import lectureShape from '../../shapes/LectureShape';


const LectureGroupBlockRow = ({
  t,
  lecture,
  isRaised, isHighlighted, inTimetable, isTimetableReadonly, inCart, fromCart,
  addToCart, addToTable, deleteFromCart,
  listHover, listOut, listClick,
}) => {
  const getClass = (lec) => {
    switch (lec.class_title.length) {
      case 1:
        return classNames('block--lecture-group__elem__texts__main__fixed-1');
      case 2:
        return classNames('block--lecture-group__elem__texts__main__fixed-2');
      default:
        return classNames('');
    }
  };

  const onDeleteFromCartClick = (event) => {
    event.stopPropagation();
    deleteFromCart(lecture);
  };
  const onAddToCartClick = (event) => {
    event.stopPropagation();
    addToCart(lecture);
  };
  const onAddToTableClick = (event) => {
    event.stopPropagation();
    addToTable(lecture);
  };

  return (
    <div
      className={classNames(
        'block--lecture-group__elem-wrap',
        (isRaised ? 'block--raised' : ''),
        (isHighlighted ? 'block--highlighted' : ''),
      )}
      data-id={lecture.id}
      onClick={() => listClick(lecture)()}
      onMouseOver={() => listHover(lecture)()}
      onMouseOut={() => listOut()}
    >
      <div className={classNames('block--lecture-group__elem')}>
        <div className={classNames('block--lecture-group__elem__texts')}>
          <div className={classNames('block--lecture-group__elem__texts__sub')}>
            {lecture[t('js.property.department_name')]}
            {' / '}
            {lecture[t('js.property.type')]}
          </div>
          <div className={classNames('block--lecture-group__elem__texts__main')}>
            <strong className={getClass(lecture)}>{lecture[t('js.property.class_title')]}</strong>
            {' '}
            <span>
              {getProfessorsShortStr(lecture)}
            </span>
          </div>
          <div className={classNames('block--lecture-group__elem__texts__sub')}>
            {getClassroomStr(lecture)}
            {' / '}
            {lecture.limit}
          </div>
        </div>
        {
          fromCart
            ? <button className={classNames('block--lecture-group__elem__button')} onClick={onDeleteFromCartClick}><i className={classNames('icon', 'icon--delete-cart')} /></button>
            : (
              !inCart
                ? <button className={classNames('block--lecture-group__elem__button')} onClick={onAddToCartClick}><i className={classNames('icon', 'icon--add-cart')} /></button>
                : <button className={classNames('block--lecture-group__elem__button', 'block--lecture-group__elem__button--disable')}><i className={classNames('icon', 'icon--add-cart')} /></button>
            )
        }
        {
          !inTimetable && !isTimetableReadonly
            ? <button className={classNames('block--lecture-group__elem__button')} onClick={onAddToTableClick}><i className={classNames('icon', 'icon--add-lecture')} /></button>
            : <button className={classNames('block--lecture-group__elem__button', 'block--lecture-group__elem__button--disable')}><i className={classNames('icon', 'icon--add-lecture')} /></button>
        }
      </div>
    </div>
  );
};

LectureGroupBlockRow.propTypes = {
  lecture: lectureShape.isRequired,
  isRaised: PropTypes.bool.isRequired,
  isHighlighted: PropTypes.bool.isRequired,
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

export default withTranslation()(React.memo(LectureGroupBlockRow));

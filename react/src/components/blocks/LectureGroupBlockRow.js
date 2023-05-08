import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import { getProfessorsShortStr, getClassroomStr } from '../../utils/lectureUtils';

import lectureShape from '../../shapes/model/subject/LectureShape';


const LectureGroupBlockRow = ({
  t,
  lecture,
  isHighlighted,
  inTimetable, isTimetableReadonly, inCart, fromCart,
  addToCart, addToTable, deleteFromCart,
  onMouseOver, onMouseOut, onClick,
}) => {
  const getClass = (lec) => {
    switch (lec.class_title.length) {
      case 1:
        return classNames('block--lecture-group__row-content__texts__main__fixed-1');
      case 2:
        return classNames('block--lecture-group__row-content__texts__main__fixed-2');
      default:
        return classNames('');
    }
  };

  const handleMouseOver = onMouseOver
    ? (event) => {
      onMouseOver(lecture);
    }
    : null;
  const handleMouseOut = onMouseOut
    ? (event) => {
      onMouseOut(lecture);
    }
    : null;
  const handleClick = onClick
    ? (event) => {
      onClick(lecture);
    }
    : null;
  const handleDeleteFromCartClick = (event) => {
    event.stopPropagation();
    deleteFromCart(lecture);
  };
  const handleAddToCartClick = (event) => {
    event.stopPropagation();
    addToCart(lecture);
  };
  const handleAddToTableClick = (event) => {
    event.stopPropagation();
    addToTable(lecture);
  };

  const cartButton = (
    fromCart
      ? (
        <button className={classNames('block--lecture-group__row-content__button')} onClick={handleDeleteFromCartClick}>
          <i className={classNames('icon', 'icon--delete-cart')} />
        </button>
      )
      : (
        !inCart
          ? (
            <button className={classNames('block--lecture-group__row-content__button')} onClick={handleAddToCartClick}>
              <i className={classNames('icon', 'icon--add-cart')} />
            </button>
          )
          : (
            <button className={classNames('block--lecture-group__row-content__button', 'block--lecture-group__row-content__button--disable')}>
              <i className={classNames('icon', 'icon--add-cart')} />
            </button>
          )
      )
  );
  const timetableButton = (
    !inTimetable && !isTimetableReadonly
      ? (
        <button className={classNames('block--lecture-group__row-content__button')} onClick={handleAddToTableClick}>
          <i className={classNames('icon', 'icon--add-lecture')} />
        </button>
      )
      : (
        <button className={classNames('block--lecture-group__row-content__button', 'block--lecture-group__row-content__button--disable')}>
          <i className={classNames('icon', 'icon--add-lecture')} />
        </button>
      )
  );

  return (
    <div
      className={classNames(
        'block--lecture-group__row',
        (isHighlighted ? 'block--lecture-group__row--highlighted' : null),
      )}
      data-id={lecture.id}
      onClick={handleClick}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      <div className={classNames('block--lecture-group__row-content')}>
        <div className={classNames('block--lecture-group__row-content__texts')}>
          <div className={classNames('block--lecture-group__row-content__texts__sub')}>
            {lecture[t('js.property.department_name')]}
            {' / '}
            {lecture[t('js.property.type')]}
          </div>
          <div className={classNames('block--lecture-group__row-content__texts__main')}>
            <strong className={getClass(lecture)}>{lecture[t('js.property.class_title')]}</strong>
            {' '}
            <span>
              {getProfessorsShortStr(lecture)}
            </span>
          </div>
          <div className={classNames('block--lecture-group__row-content__texts__sub')}>
            {getClassroomStr(lecture)}
            {' / '}
            {lecture.limit}
          </div>
        </div>
        { cartButton }
        { timetableButton }
      </div>
    </div>
  );
};

LectureGroupBlockRow.propTypes = {
  lecture: lectureShape.isRequired,
  isHighlighted: PropTypes.bool.isRequired,
  inTimetable: PropTypes.bool.isRequired,
  isTimetableReadonly: PropTypes.bool.isRequired,
  inCart: PropTypes.bool.isRequired,
  fromCart: PropTypes.bool.isRequired,
  addToCart: PropTypes.func.isRequired,
  addToTable: PropTypes.func.isRequired,
  deleteFromCart: PropTypes.func.isRequired,
  onMouseOver: PropTypes.func,
  onMouseOut: PropTypes.func,
  onClick: PropTypes.func,
};

export default withTranslation()(
  React.memo(
    LectureGroupBlockRow
  )
);

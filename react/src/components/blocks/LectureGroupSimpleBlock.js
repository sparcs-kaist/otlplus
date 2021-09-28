import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import { getProfessorsShortStr } from '../../utils/lectureUtils';

import lectureShape from '../../shapes/LectureShape';


const LectureGroupSimpleBlock = ({ t, lectures }) => {
  const getClass = (lec) => {
    if (!lec.class_title) {
      return classNames('');
    }
    switch (lec.class_title.length) {
      case 1:
        return classNames('block--lecture-group-simple__elem__texts__fixed-1');
      case 2:
        return classNames('block--lecture-group-simple__elem__texts__fixed-2');
      default:
        return classNames('');
    }
  };
  return (
    <div className={classNames('block', 'block--lecture-group-simple')}>
      {
        lectures.map((l) => (
          <div className={classNames('block--lecture-group-simple__elem-wrap')} key={l.id}>
            <div className={classNames('block--lecture-group-simple__elem')}>
              <div className={classNames('block--lecture-group-simple__elem__texts')}>
                <strong className={getClass(l)}>{l[t('js.property.class_title')]}</strong>
                {' '}
                <span>{getProfessorsShortStr(l)}</span>
              </div>
            </div>
          </div>
        ))
      }
    </div>
  );
};

LectureGroupSimpleBlock.propTypes = {
  lectures: PropTypes.arrayOf(lectureShape).isRequired,
};

export default withTranslation()(
  React.memo(
    LectureGroupSimpleBlock
  )
);

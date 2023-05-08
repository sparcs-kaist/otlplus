import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import { getProfessorsShortStr } from '../../utils/lectureUtils';

import lectureShape from '../../shapes/model/subject/LectureShape';


const LectureGroupSimpleBlock = ({ t, lectures }) => {
  const getClass = (lecture) => {
    if (!lecture.class_title) {
      return classNames('');
    }
    switch (lecture.class_title.length) {
      case 1:
        return classNames('block--lecture-group-simple__row-content__texts__fixed-1');
      case 2:
        return classNames('block--lecture-group-simple__row-content__texts__fixed-2');
      default:
        return classNames('');
    }
  };
  return (
    <div className={classNames('block', 'block--lecture-group-simple')}>
      {
        lectures.map((l) => (
          <div className={classNames('block--lecture-group-simple__row')} key={l.id}>
            <div className={classNames('block--lecture-group-simple__row-content')}>
              <div className={classNames('block--lecture-group-simple__row-content__texts')}>
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

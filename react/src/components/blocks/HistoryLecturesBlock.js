import React from 'react';
import PropTypes from 'prop-types';
import { pure } from 'recompose';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';

import lectureShape from '../../shapes/LectureShape';


const HistoryLecturesBlock = ({ t, lectures }) => {
  const getClass = (lec) => {
    switch (lec.class_title.length) {
      case 1:
        return classNames('block--history-lectures__elem__texts__fixed-1');
      case 2:
        return classNames('block--history-lectures__elem__texts__fixed-2');
      default:
        return classNames('');
    }
  };
  return (
    <div className={classNames('block', 'block--history-lectures')}>
      {
        lectures.map(lecture => (
          <div className={classNames('block--history-lectures__elem-wrap')} key={lecture.id}>
            <div className={classNames('block--history-lectures__elem')}>
              <div className={classNames('block--history-lectures__elem__texts')}>
                <strong className={getClass(lecture)}>{lecture[t('js.property.class_title')]}</strong>
                {' '}
                <span>{lecture[t('js.property.professor_short')]}</span>
              </div>
            </div>
          </div>
        ))
      }
    </div>
  );
};

HistoryLecturesBlock.propTypes = {
  lectures: PropTypes.arrayOf(lectureShape).isRequired,
};

export default withTranslation()(pure(HistoryLecturesBlock));

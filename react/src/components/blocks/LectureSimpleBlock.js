import React from 'react';
import { pure } from 'recompose';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import lectureShape from '../../shapes/LectureShape';


// eslint-disable-next-line arrow-body-style
const LectureSimpleBlock = ({ t, lecture }) => {
  return (
    <div className={classNames('block', 'block--course-simple')}>
      <div className={classNames('block--course-simple__title')}>
        { lecture[t('js.property.title')] }
      </div>
      <div className={classNames('block--course-simple__subtitle')}>
        { lecture.old_code }
      </div>
    </div>
  );
};

LectureSimpleBlock.propTypes = {
  lecture: lectureShape.isRequired,
};


export default withTranslation()(pure(LectureSimpleBlock));

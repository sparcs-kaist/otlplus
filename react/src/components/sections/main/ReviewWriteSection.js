import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import ReviewWriteBlock from '../../blocks/ReviewWriteBlock';


class ReviewWriteSection extends Component {
  render() {
    const { t } = this.props;
    const lecture = {
      title: '문제해결기법',
      title_en: 'Problem Solving',
      professor_short: '김기응',
      year: 2018,
      semester: 1,
    };

    return (
      <div className={classNames('section-content', 'section-content--widget')}>
        <div className={classNames('title')}>
          {`${t('ui.title.writeReview')} - ${lecture[t('js.property.title')]}`}
        </div>
        <ReviewWriteBlock lecture={lecture} />
        <div className={classNames('buttons')}>
          <button className={classNames('text-button')}>
            {t('ui.button.writeMoreReviews')}
          </button>
        </div>
      </div>
    );
  }
}


export default withTranslation()(ReviewWriteSection);

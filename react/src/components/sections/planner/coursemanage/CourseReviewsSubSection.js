import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import ReviewBlock from '../../../blocks/ReviewBlock';

import itemFocusShape from '../../../../shapes/state/planner/ItemFocusShape';


class CourseReviewsSubSection extends Component {
  render() {
    const { t } = this.props;
    const { itemFocus } = this.props;

    if (!itemFocus.course) {
      return null;
    }

    const reviewBlocksArea = (itemFocus.reviews == null)
      ? (
        <div className={classNames('list-placeholder', 'min-height-area')}>
          <div>{t('ui.placeholder.loading')}</div>
        </div>
      )
      : (itemFocus.reviews.length
        ? (
          <div className={classNames('block-list', 'min-height-area')}>
            {
              itemFocus.reviews.map((r) => (
                <ReviewBlock
                  review={r}
                  shouldLimitLines={false}
                  pageFrom="Dictionary"
                  key={r.id}
                />
              ))
            }
          </div>
        )
        : (
          <div className={classNames('list-placeholder', 'min-height-area')}>
            <div>{t('ui.placeholder.noResults')}</div>
          </div>
        )
      );

    return (
      <div className={classNames('subsection', 'subsection--course-reviews')}>
        <div className={classNames('small-title')}>{t('ui.title.reviews')}</div>
        {reviewBlocksArea}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  itemFocus: state.planner.itemFocus,
});

const mapDispatchToProps = (dispatch) => ({
});

CourseReviewsSubSection.propTypes = {
  itemFocus: itemFocusShape.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    CourseReviewsSubSection
  )
);

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { sumBy } from 'lodash';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import userShape from '../../../shapes/UserShape';


class MySummarySubSection extends Component {
  render() {
    const { t } = this.props;
    const { user } = this.props;

    const writableTakenLectures = user ? user.review_writable_lectures : [];
    const editableReviews = user
      ? user.reviews.filter((r) => writableTakenLectures.some((l) => l.id === r.lecture.id))
      : [];

    return (
      <div className={classNames('subsection', 'subsection--my-summary')}>
        <div className={classNames('title')}>
          {t('ui.title.takenLectures')}
        </div>
        <div className={classNames('scores')}>
          <div>
            <div>
              <span>{user ? editableReviews.length : '-'}</span>
              <span>{user ? `/${writableTakenLectures.length}` : '/-'}</span>
            </div>
            <div>{t('ui.score.reviewsWritten')}</div>
          </div>
          <div>
            <div>
              {user ? sumBy(editableReviews, (r) => r.like) : '-'}
            </div>
            <div>{t('ui.score.likes')}</div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
});

const mapDispatchToProps = (dispatch) => ({
});

MySummarySubSection.propTypes = {
  user: userShape,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    MySummarySubSection
  )
);

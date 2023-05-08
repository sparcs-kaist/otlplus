import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { sumBy } from 'lodash';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import userShape from '../../../../shapes/model/session/UserShape';
import Scores from '../../../Scores';


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
        <Scores
          entries={[
            {
              name: t('ui.score.reviewsWritten'),
              score: (
                <>
                  <span>{user ? editableReviews.length : '-'}</span>
                  <span>{user ? `/${writableTakenLectures.length}` : '/-'}</span>
                </>
              ),
            },
            {
              name: t('ui.score.likes'),
              score: (user ? sumBy(editableReviews, (r) => r.like) : '-'),
            },
          ]}
        />
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

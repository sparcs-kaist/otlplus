import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import qs from 'qs';
import axios from 'axios';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import ReviewBlock from '../../blocks/ReviewBlock';
import { ReviewsFocusFrom } from '../../../reducers/write-reviews/reviewsFocus';


class LatestReviewSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reviews: null,
    };
  }


  componentDidMount() {
    axios.get(
      '/api/reviews',
      {
        params: {
          order: ['-written_datetime', '-id'],
          offset: 0,
          limit: 3,
        },
        metadata: {
          gaCategory: 'Review',
          gaVariable: 'GET Latest / List',
        },
      },
    )
      .then((response) => {
        this.setState((prevState) => ({
          reviews: response.data,
        }));
      })
      .catch((error) => {
      });
  }


  mapReviewsToElement = (reviews) => {
    const { t } = this.props;

    if (reviews == null) {
      return <div className={classNames('list-placeholder')}>{t('ui.placeholder.loading')}</div>;
    }
    if (reviews.length === 0) {
      return <div className={classNames('list-placeholder')}>{t('ui.placeholder.noResults')}</div>;
    }
    return (
      <div className={classNames('block-list')}>
        {
          reviews.map((r) => (
            <ReviewBlock
              review={r}
              shouldLimitLines={true}
              linkTo={{ pathname: '/dictionary', search: qs.stringify({ startCourseId: r.course.id }) }}
              pageFrom="Main"
              key={r.id}
            />
          ))
        }
      </div>
    );
  };


  render() {
    const { t } = this.props;
    const { reviews } = this.state;

    return (
    // eslint-disable-next-line react/jsx-indent
    <div className={classNames('section', 'section--feed')}>
      <div className={classNames('subsection', 'subsection--feed')}>
        <div className={classNames('title')}>
          {t('ui.title.latestReviews')}
        </div>
        {this.mapReviewsToElement(reviews)}
        <div className={classNames('buttons')}>
          <Link
            to={{ pathname: '/write-reviews', search: qs.stringify({ startList: ReviewsFocusFrom.REVIEWS_LATEST }) }}
            className={classNames('text-button')}
          >
            {t('ui.button.seeMoreReviews')}
          </Link>
        </div>
      </div>
    </div>
    );
  }
}


export default withTranslation()(
  LatestReviewSection
);

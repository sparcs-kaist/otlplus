import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';


class RateFeedSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ratedNow: false,
      score: 0,
    };
  }


  isRated = () => {
    const { rated } = this.props;
    const { ratedNow } = this.state;

    return rated || ratedNow;
  }


  setScore = (score) => {
    this.setState({
      score: score,
    });
  }


  submit = () => {
    const { score } = this.state;

    if (this.isRated()) {
      return;
    }
    if (!score || score < 1 || score > 5) {
      return;
    }

    this.setState({
      ratedNow: true,
    });

    axios.post(
      '/api/rates',
      {
        score: score,
      },
      {
        metadata: {
          gaCategory: 'Review',
          gaVariable: 'POST Like / Instance',
        },
      },
    )
      .then((response) => {
      })
      .catch((error) => {
      });

    ReactGA.event({
      category: 'Rate',
      action: 'Created Rate',
    });
  }


  render() {
    const { t } = this.props;
    const { score } = this.state;

    return (
    // eslint-disable-next-line react/jsx-indent
    <div className={classNames('section', 'section--feed')}>
      <div className={classNames('subsection', 'subsection--feed')}>
        <div className={classNames('title')}>
          {t('ui.title.rateOtl')}
        </div>
        <div className={classNames('rate')}>
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              className={classNames('rate__star', ((score >= s && !this.isRated()) ? 'rate__star--selected' : null))}
              onClick={() => this.setScore(s)}
              key={s}
            >
              <i className={classNames('icon', 'icon--star')} />
            </button>
          ))}
          { this.isRated()
            ? <div className={classNames('rate__overlay', 'placeholder')}>{t('ui.message.alreadyRated')}</div>
            : null
          }
        </div>
        <div className={classNames('buttons')}>
          <button
            className={classNames('text-button', (this.isRated() ? 'text-button--disabled' : null))}
            onClick={this.submit}
          >
            {t('ui.button.submit')}
          </button>
        </div>
      </div>
    </div>
    );
  }
}

RateFeedSection.propTypes = {
  rated: PropTypes.bool.isRequired,
};


export default withTranslation()(
  RateFeedSection
);

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { guidelineBoundClassNames as classNames } from '../../boundClassNames';

import logoImage from '../images/SPARCS_black.svg';
import { CONTACT } from '../../constants';


class Footer extends Component {
  render() {
    const { t } = this.props;

    return (
      <footer>
        <div className={classNames('content')}>
          <div className={classNames('content-left', 'reverse')}>
            <div className={classNames('logo')}>
              <span>
                <a href="http://sparcs.org" target="_blank" rel="noopener noreferrer">
                  <img src={logoImage} alt="OTL Logo" />
                </a>
              </span>
            </div>
            <div className={classNames('menus')}>
              <span>
                <Link to="/credits">
                  {t('ui.menu.credit')}
                </Link>
              </span>
              <span>
                <Link to="/licenses">
                  {t('ui.menu.licences')}
                </Link>
              </span>
              <span>
                <Link to="/privacy">
                  {t('ui.menu.privacy')}
                </Link>
              </span>
            </div>
          </div>
          <div className={classNames('contact')}>
            <span>
              <a href={`mailto:${CONTACT}`}>{ CONTACT }</a>
            </span>
          </div>
        </div>
      </footer>
    );
  }
}

const mapStateToProps = (state) => ({
});

const mapDispatchToProps = (dispatch) => ({
});

Footer.propTypes = {
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    Footer
  )
);

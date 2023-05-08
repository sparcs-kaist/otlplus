import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { guidelineBoundClassNames as classNames, appBoundClassNames } from '../../boundClassNames';

import userShape from '../../../shapes/model/session/UserShape';

import logoImage from '../images/Services-OTL.svg';

import { API_URL } from '../../../const';


export const getFullName = (user) => {
  // eslint-disable-next-line no-underscore-dangle
  const _isKorean = (string) => {
    const reg = new RegExp('[가-힣]+');
    return reg.test(string);
  };

  if (_isKorean(user.firstName) && _isKorean(user.lastName)) {
    return `${user.lastName}${user.firstName}`;
  }
  return `${user.firstName} ${user.lastName}`;
};


class Header extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mobileIsMenuOpen: false,
      noBackground: false,
    };
  }


  componentDidMount() {
    window.addEventListener('scroll', this.setNoBackground);
    this.setNoBackground();
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props;

    if (location.pathname !== prevProps.location.pathname) {
      this.setNoBackground();
      this.closeMenu();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.setNoBackground);
  }


  closeMenu = () => {
    this.setState({
      mobileIsMenuOpen: false,
    });
  }


  toggleMenu = () => {
    const { mobileIsMenuOpen } = this.state;
    this.setState({
      mobileIsMenuOpen: !mobileIsMenuOpen,
    });
  }


  setNoBackground = () => {
    const mainImage = document.getElementsByClassName(appBoundClassNames('section--main-search'));
    if (mainImage.length === 0) {
      this.setState({
        noBackground: false,
      });
      return;
    }

    this.setState({
      noBackground: mainImage[0].getBoundingClientRect().top > 55,
    });
  }


  render() {
    const { t, i18n } = this.props;
    const { mobileIsMenuOpen, noBackground } = this.state;
    const { user } = this.props;

    return (
      <header>
        <div className={classNames('identity-bar')} />
        <div
          className={classNames(
            'content',
            (mobileIsMenuOpen ? null : 'menu-closed'),
            (noBackground && !mobileIsMenuOpen ? 'no-background' : null),
          )}
        >
          <button className={classNames('menu-icon-icon')} onClick={this.toggleMenu}>
            { mobileIsMenuOpen
              ? <i className={classNames('icon--header_menu_close')} />
              : <i className={classNames('icon--header_menu_list')} />
            }
          </button>
          <div className={classNames('content-left')}>
            <div className={classNames('logo')}>
              <span>
                <Link to="/">
                  <img src={logoImage} alt="OTL Logo" />
                </Link>
              </span>
            </div>
            <div className={classNames('menus')}>
              <span>
                <Link to="/dictionary">
                  {t('ui.menu.dictionary')}
                </Link>
              </span>
              <span>
                <Link to="/timetable">
                  {t('ui.menu.timetable')}
                </Link>
              </span>
              <span>
                <Link to="/write-reviews">
                  {t('ui.menu.writeReviews')}
                </Link>
              </span>
              <span>
                <Link to="/planner">
                  {t('ui.menu.planner')}
                  <sup>BETA</sup>
                </Link>
              </span>
            </div>
          </div>
          <div className={classNames('content-right')}>
            <div className={classNames('special-menus')}>
              {null}
            </div>
            <div className={classNames('common-menus')}>
              <span>
                <button onClick={() => i18n.changeLanguage(i18n.language.startsWith('ko') ? 'en' : 'ko')}>
                  <i className={classNames('icon--header_language')} />
                  <span>{t('ui.menu.toggleLang')}</span>
                </button>
              </span>
              {/*
              <span>
                <Link to=".">
                  <i className={classNames('icon--header_notification')} />
                  <span>{t('ui.menu.notifications')}</span>
                </Link>
              </span>
              */}
              <span>
                { user
                  ? (
                    <Link to="/account">
                      <i className={classNames('icon--header_user')} />
                      <span>
                        {getFullName(user)}
                      </span>
                    </Link>
                  )
                  : user === undefined
                    ? (

                      <span>
                        <i className={classNames('icon--header_user')} />
                        <span>
                          {t('ui.placeholder.loading')}
                        </span>
                      </span>
                    )
                    : (

                      <a href={`${API_URL}/session/login/?next=${window.location.href}`}>
                        <i className={classNames('icon--header_user')} />
                        <span>
                          {t('ui.menu.signIn')}
                        </span>
                      </a>
                    )
                }
              </span>
            </div>
          </div>
        </div>
      </header>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
});

const mapDispatchToProps = (dispatch) => ({
});

Header.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,

  user: userShape,
};

export default withTranslation()(
  withRouter(
    connect(mapStateToProps, mapDispatchToProps)(
      Header
    )
  )
);

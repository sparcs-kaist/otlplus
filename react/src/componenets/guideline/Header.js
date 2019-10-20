import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import userShape from '../../shapes/UserShape';

import { guidelineBoundClassNames as classNames } from '../../common/boundClassNames';

import logoImage from '../../static/img/Services-OTL.svg';


class Header extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mobileMenuOpen: false,
    };
  }


  closeMenu = () => {
    this.setState({
      mobileMenuOpen: false,
    });
  }


  toggleMenu = () => {
    const { mobileMenuOpen } = this.state;
    this.setState({
      mobileMenuOpen: !mobileMenuOpen,
    });
  }


  render() {
    const { mobileMenuOpen } = this.state;
    const { user } = this.props;

    console.log(123, logoImage);

    return (
      <header>
        <div className={classNames('identity-bar')} />
        <div className={classNames('menu-icon-icon')} onClick={this.toggleMenu}>
          { mobileMenuOpen
            ? <i className={classNames('icon--header_menu_close')} />
            : <i className={classNames('icon--header_menu_list')} />
          }
        </div>
        <div className={classNames('content', (mobileMenuOpen ? '' : 'menu-closed'))}>
          <div className={classNames('content-left')}>
            <div className={classNames('logo')}>
              <Link to="/" onClick={this.closeMenu}>
                <img src={logoImage} alt="OTL Logo" />
              </Link>
            </div>
            <div className={classNames('menus')}>
              <Link to="/dictionary" onClick={this.closeMenu}>
                과목사전
              </Link>
              <Link to="/timetable" onClick={this.closeMenu}>
                모의시간표
              </Link>
            </div>
          </div>
          <div className={classNames('content-right')}>
            <div className={classNames('special-menus')}>
              {null}
            </div>
            <div className={classNames('common-menus')}>
              <Link to="." onClick={this.closeMenu}>
                <i className={classNames('icon--header_language')} />
                <span>English</span>
              </Link>
              <Link to="." onClick={this.closeMenu}>
                <i className={classNames('icon--header_notification')} />
                <span>알림</span>
              </Link>
              { user
                ? (
                  <a>
                    <i className={classNames('icon--header_user')} />
                    <span>
                      {user.lastName}
                      {user.firstName}
                    </span>
                  </a>
                )
                : (
                  <a href={`/session/login/?next=${window.location.href}`}>
                    <i className={classNames('icon--header_user')} />
                    <span>
                      로그인
                    </span>
                  </a>
                )
              }
            </div>
          </div>
        </div>
      </header>
    );
  }
}

const mapStateToProps = state => ({
  user: state.common.user,
});

const mapDispatchToProps = dispatch => ({
});

Header.propTypes = {
  user: userShape,
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);

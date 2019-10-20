import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import userShape from '../../shapes/UserShape';

import { guidelineBoundClassNames as classNames } from '../../common/boundClassNames';

import logoImage from '../../static/img/Services-OTL.svg';


class Header extends Component {
  render() {
    const { user } = this.props;

    console.log(123, logoImage);

    return (
      <header>
        <div className={classNames('identity-bar')} />
        <div className={classNames('content')}>
          <div className={classNames('content-left')}>
            <Link to="/" className={classNames('logo')}>
              <img src={logoImage} alt="OTL Logo" />
            </Link>
            <div className={classNames('menus')}>
              <Link to="/dictionary">
                과목사전
              </Link>
              <Link to="/timetable">
                모의시간표
              </Link>
            </div>
          </div>
          <div className={classNames('content-right')}>
            <div className={classNames('special-menus')}>
              {null}
            </div>
            <div className={classNames('common-menus')}>
              <Link to=".">
                <i className={classNames('icon--header_language')} />
              </Link>
              <Link to=".">
                <i className={classNames('icon--header_notification')} />
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

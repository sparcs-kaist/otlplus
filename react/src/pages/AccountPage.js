import React, { Component } from 'react';

import { appBoundClassNames as classNames } from '../common/boundClassNames';


class AccountPage extends Component {
  render() {
    return (
      <section className={classNames('content', 'content--no-scroll')}>
        <a href="/session/logout/">로그아웃</a>
      </section>
    );
  }
}

AccountPage.propTypes = {
};


export default AccountPage;

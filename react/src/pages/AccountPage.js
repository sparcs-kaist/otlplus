import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

import Scroller from '../components/Scroller';
import MyInfoSection from '../components/sections/account/MyInfoSection';
import AcademicInfoSection from '../components/sections/account/AcademicInfoSection';
import FavoriteDepartmentsSection from '../components/sections/account/FavoriteDepartmentsSection';


class AccountPage extends Component {
  render() {
    const { t } = this.props;
    return (
      <section className={classNames('content', 'content--no-scroll')}>
        <div className={classNames('page-grid', 'page-grid--full')}>
          <div className={classNames('section')}>
            <div className={classNames('section-content', 'section-content--account')}>
              <Scroller expandTop={12}>
                <MyInfoSection />
                <div className={classNames('divider')} />
                <AcademicInfoSection />
                <div className={classNames('divider')} />
                <FavoriteDepartmentsSection />
                <div className={classNames('divider')} />
                <div>
                  <a href="/session/logout/" className={classNames('text-button')}>
                    {t('ui.button.signOut')}
                  </a>
                </div>
              </Scroller>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

AccountPage.propTypes = {
};


export default withTranslation()(AccountPage);

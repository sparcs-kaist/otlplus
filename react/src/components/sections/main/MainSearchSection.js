import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import qs from 'qs';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';


class MainSearchSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      keyword: '',
    };
  }

  onKeywordChange = (e) => {
    this.setState({
      keyword: e.target.value,
    });
  }

  render() {
    const { t } = this.props;
    const { keyword } = this.state;

    return (
      <form className={classNames('section-content', 'section-content--main-search')}>
        <i />
        <input type="text" placeholder={t('ui.tab.search')} onChange={this.onKeywordChange} />
        <Link to={{ pathname: '/dictionary', search: qs.stringify({ startSearchKeyword: keyword }) }}>
          <button className={classNames('text-button')} type="submit">
            {t('ui.button.search')}
          </button>
        </Link>
      </form>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
});

const mapDispatchToProps = (dispatch) => ({
});

MainSearchSection.propTypes = {
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(MainSearchSection));

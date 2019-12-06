import React, { Component } from 'react';
import { connect } from 'react-redux';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';


class MainSearchSection extends Component {
  render() {
    return (
      <form className={classNames('section-content', 'section-content--main-search')}>
        <i />
        <input type="text" placeholder="검색" />
        <button className={classNames('text-button')} type="submit">검색</button>
      </form>
    );
  }
}

const mapStateToProps = state => ({
  user: state.common.user,
});

const mapDispatchToProps = dispatch => ({
});

MainSearchSection.propTypes = {
};


export default connect(mapStateToProps, mapDispatchToProps)(MainSearchSection);

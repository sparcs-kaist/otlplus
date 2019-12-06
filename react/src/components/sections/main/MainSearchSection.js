import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

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
    const { keyword } = this.state;

    return (
      <form className={classNames('section-content', 'section-content--main-search')}>
        <i />
        <input type="text" placeholder="검색" onChange={this.onKeywordChange} />
        <Link to={{ pathname: '/dictionary', state: { startSearchKeyword: keyword } }}><button className={classNames('text-button')} type="submit">검색</button></Link>
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

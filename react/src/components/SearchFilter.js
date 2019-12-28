import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

import SearchCircle from './SearchCircle';


class SearchFilter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      allChecked: true,
      checkNum: 1,
    };
  }

  clickCircle = (value, isChecked) => {
    const { allChecked, checkNum } = this.state;
    const { inputName, clickCircle } = this.props;

    const filter = {
      name: inputName,
      value: value,
      isChecked: isChecked,
    };
    clickCircle(filter);
    if (value === 'ALL' && isChecked) {
      this.setState({
        allChecked: true,
      }); // It is alreat send to Search
    }
    else if (isChecked) {
      // Check without all button, checkout all button
      if (allChecked) {
        this.setState({
          allChecked: false,
          checkNum: 1,
        });
        clickCircle({
          ...filter,
          value: 'ALL',
          isChecked: false,
        });
      }
      else {
        this.setState(state => ({
          checkNum: state.checkNum + 1,
        }));
      }
    }
    else { // When Check out somtething
      // eslint-disable-next-line no-lonely-if
      if (checkNum === 1) {
        this.setState({
          allChecked: true,
        }); // All circle check out so have to check all
        clickCircle({
          ...filter,
          value: 'ALL',
          isChecked: true,
        });
      }
      else {
        this.setState(state => ({
          checkNum: state.checkNum - 1,
        }));
        // All circle check out so have to check all
      }
    }
  }


  render() {
    const { allChecked } = this.state;
    const { inputName, titleName, options } = this.props;
    const mapCircle = o => (
      <SearchCircle
        key={o[0]}
        value={o[0]}
        inputName={inputName}
        circleName={o[1]}
        clickCircle={this.clickCircle}
        allChecked={allChecked}
      />
    );


    return (
      <div className={classNames('attribute')}>
        <span>{ titleName }</span>
        <div>
          {options.map(mapCircle)}
        </div>
      </div>
    );
  }
}

SearchFilter.propTypes = {
  clickCircle: PropTypes.func.isRequired,
  inputName: PropTypes.string.isRequired,
  titleName: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
};

export default SearchFilter;

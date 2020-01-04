import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

import SearchCircle from './SearchCircle';


class SearchFilter extends Component {
  _isChecked = (value) => {
    const { checkedValues } = this.props;
    return checkedValues.has(value);
  }

  clickCircle = (value, isChecked) => {
    const { inputName, clickCircle, checkedValues } = this.props;

    const filter = {
      name: inputName,
      value: value,
      isChecked: isChecked,
    };
    clickCircle(filter);
    if (value === 'ALL' && isChecked) {
    }
    else if (isChecked) {
      // Check without all button, checkout all button
      if (this._isChecked('ALL')) {
        clickCircle({
          ...filter,
          value: 'ALL',
          isChecked: false,
        });
      }
      else {
      }
    }
    else { // When Check out somtething
      // eslint-disable-next-line no-lonely-if
      if (checkedValues.size === 1) {
        this.setState({
        }); // All circle check out so have to check all
        clickCircle({
          ...filter,
          value: 'ALL',
          isChecked: true,
        });
      }
      else {
        // All circle check out so have to check all
      }
    }
  }


  render() {
    const { inputName, titleName, options } = this.props;
    const mapCircle = o => (
      <SearchCircle
        key={o[0]}
        value={o[0]}
        inputName={inputName}
        circleName={o[1]}
        clickCircle={this.clickCircle}
        allChecked={this._isChecked('ALL')}
      />
    );


    return (
      <div className={classNames('attribute')}>
        <span>{ titleName }</span>
        <div className={classNames('search-fields')}>
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
  checkedValues: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default SearchFilter;

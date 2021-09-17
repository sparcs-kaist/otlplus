import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

import SearchFilterEntity from './SearchFilterEntity';


class SearchFilter extends Component {
  _isChecked = (value) => {
    const { checkedValues } = this.props;
    return checkedValues.has(value);
  }

  _handleValueCheckedChange = (value, isChecked) => {
    const { checkedValues, updateCheckedValues } = this.props;

    if (isChecked) {
      if (value === 'ALL') {
        updateCheckedValues(new Set(['ALL']));
      }
      else {
        const checkedValuesCopy = new Set(checkedValues);
        checkedValuesCopy.add(value);
        checkedValuesCopy.delete('ALL');
        updateCheckedValues(checkedValuesCopy);
      }
    }
    else {
      // eslint-disable-next-line no-lonely-if
      if (value === 'ALL') {
        // Pass
      }
      else {
        const checkedValuesCopy = new Set(checkedValues);
        checkedValuesCopy.delete(value);
        if (checkedValuesCopy.size === 0) {
          checkedValuesCopy.add('ALL');
        }
        updateCheckedValues(checkedValuesCopy);
      }
    }
  }


  render() {
    const {
      inputName, titleName, options, checkedValues,
    } = this.props;

    const VALUE_INDEX = 0;
    const LABEL_INDEX = 1;

    const mapCircle = (o) => (
      <SearchFilterEntity
        key={o[VALUE_INDEX]}
        value={o[VALUE_INDEX]}
        name={inputName}
        label={o[LABEL_INDEX]}
        onChange={(e) => this._handleValueCheckedChange(e.target.value, e.target.checked)}
        isChecked={checkedValues.has(o[VALUE_INDEX])}
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
  updateCheckedValues: PropTypes.func.isRequired,
  inputName: PropTypes.string.isRequired,
  titleName: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
  checkedValues: PropTypes.instanceOf(Set).isRequired,
};

export default SearchFilter;

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

import SearchFilterEntity from './SearchFilterEntity';


const VALUE_INDEX = 0;
const LABEL_INDEX = 1;
const DIMMED_INDEX = 2;


class SearchFilter extends Component {
  _isChecked = (value) => {
    const { checkedValues } = this.props;
    return checkedValues.has(value);
  }

  _handleValueCheckedChange = (value, isChecked) => {
    const {
      isRadio, options, checkedValues, updateCheckedValues,
    } = this.props;

    if (isRadio) {
      updateCheckedValues(new Set([value]));
    }
    else if (isChecked) {
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
        if (checkedValuesCopy.size === 0 && options.some((o) => (o[VALUE_INDEX] === 'ALL'))) {
          checkedValuesCopy.add('ALL');
        }
        updateCheckedValues(checkedValuesCopy);
      }
    }
  }


  render() {
    const {
      inputName, titleName, options, checkedValues, isRadio,
    } = this.props;

    const mapCircle = (o) => (
      <SearchFilterEntity
        key={o[VALUE_INDEX]}
        value={o[VALUE_INDEX]}
        name={inputName}
        label={o[LABEL_INDEX]}
        isRadio={isRadio}
        isDimmed={o[DIMMED_INDEX]}
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
  options: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.bool]))
  ).isRequired,
  checkedValues: PropTypes.instanceOf(Set).isRequired,
  isRadio: PropTypes.bool,
};

export default SearchFilter;

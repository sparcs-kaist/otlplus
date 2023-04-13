import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../common/boundClassNames';


class SearchFilterEntity extends Component {
  render() {
    const {
      value, name, label, isRadio, isDimmed, onChange, isChecked,
    } = this.props;
    const isAll = (value === 'ALL');
    const inputId = `${name}-${value}`;
    return (
      <label
        className={classNames(
          'search-fields__label',
          (isDimmed ? 'search-fields__label--dimmed' : ''),
        )}
        htmlFor={inputId}
      >
        <input
          id={inputId}
          className={isAll ? 'chkall' : 'chkelem'}
          type="checkbox"
          autoComplete="off"
          name={name}
          value={value}
          onChange={onChange}
          checked={isChecked}
        />
        { label }
        <i className={classNames('icon', (isRadio ? 'icon--radio' : 'icon--checkbox'))} />
      </label>
    );
  }
}

SearchFilterEntity.propTypes = {
  value: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isRadio: PropTypes.bool,
  isDimmed: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  isChecked: PropTypes.bool.isRequired,
};

export default SearchFilterEntity;

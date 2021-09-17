import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { appBoundClassNames } from '../common/boundClassNames';


class SearchFilterEntity extends Component {
  render() {
    const {
      value, name, label, onChange, isChecked,
    } = this.props;
    const isAll = (value === 'ALL');
    const inputId = `${name}-${value}`;
    return (
      <label htmlFor={inputId}>
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
        <i className={appBoundClassNames('icon', 'icon--checkbox')} />
      </label>
    );
  }
}

SearchFilterEntity.propTypes = {
  value: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  isChecked: PropTypes.bool.isRequired,
};

export default SearchFilterEntity;

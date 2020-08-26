import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { appBoundClassNames } from '../common/boundClassNames';


class SearchCircle extends Component {
  onChange(e) {
    const { clickCircle, isChecked } = this.props;

    clickCircle(!isChecked);
  }


  render() {
    const { value, inputName, circleName, isChecked } = this.props;
    const isAll = (value === 'ALL');
    const inputId = `${inputName}-${value}`;
    return (
      <label htmlFor={inputId}>
        <input
          id={inputId}
          className={isAll ? 'chkall' : 'chkelem'}
          type="checkbox"
          autoComplete="off"
          name={inputName}
          value={value}
          onChange={e => this.onChange(e)}
          checked={isChecked}
        />
        {circleName}
        <i className={appBoundClassNames('icon', 'icon--checkbox')} />
      </label>
    );
  }
}

SearchCircle.propTypes = {
  value: PropTypes.string.isRequired,
  inputName: PropTypes.string.isRequired,
  circleName: PropTypes.string.isRequired,
  clickCircle: PropTypes.func.isRequired,
  isChecked: PropTypes.bool.isRequired,
};

export default SearchCircle;

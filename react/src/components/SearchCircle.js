import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { appBoundClassNames } from '../common/boundClassNames';


class SearchCircle extends Component {
  onChange(e) {
    const { clickCircle, isChecked } = this.props;
    const { value } = e.target;

    clickCircle(value, !isChecked);
  }


  render() {
    const { value, inputName, circleName, isChecked } = this.props;
    const all = (value === 'ALL');
    return (
      <label>
        <input
          className={all ? 'chkall' : 'chkelem'}
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
  allChecked: PropTypes.bool.isRequired,
};

export default SearchCircle;

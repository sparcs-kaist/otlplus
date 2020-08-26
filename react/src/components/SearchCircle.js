import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames } from '../common/boundClassNames';


class SearchCircle extends Component {
  onChange(e) {
    const { clickCircle, isChecked } = this.props;

    clickCircle(!isChecked);
  }


  render() {
    const { t, value, inputName, labelNameKey, isChecked } = this.props;
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
        {t(labelNameKey)}
        <i className={appBoundClassNames('icon', 'icon--checkbox')} />
      </label>
    );
  }
}

SearchCircle.propTypes = {
  value: PropTypes.string.isRequired,
  inputName: PropTypes.string.isRequired,
  labelNameKey: PropTypes.string.isRequired,
  clickCircle: PropTypes.func.isRequired,
  isChecked: PropTypes.bool.isRequired,
};

export default withTranslation()(SearchCircle);

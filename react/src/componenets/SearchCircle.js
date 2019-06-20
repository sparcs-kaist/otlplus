import React, { Component } from 'react';
import PropTypes from 'prop-types';


class SearchCircle extends Component {
  constructor(props) {
    super(props);

    const { value } = this.props;
    this.state = {
      isChecked: value === 'ALL',
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // Return value will be set the state
    if (nextProps.value === 'ALL') {
      return { isChecked: nextProps.allChecked };
    }
    if (nextProps.allChecked) {
      return { isChecked: false };
    }
    return null;
  }

  onClick(e) {
    const { isChecked } = this.state;
    const { clickCircle } = this.props;
  
    const value = e.target.value;
    if (isChecked && value === 'ALL') {
      return; // Nothing do, return
    }
    clickCircle(value, !isChecked);
    this.setState(prevState => ({
      isChecked: !prevState.isChecked,
    }));
  }


  render() {
    const { value, inputName, circleName } = this.props;
    const { isChecked } = this.state;
    const all = (value === 'ALL');
    const circleIcon = isChecked
      ? (<i className="fa fa-check-circle-o fa-ix" />)
      : (<i className="fa fa-circle-o fa-1x" />);
    return (
      <label>
        <input
          className={all ? 'chkall' : 'chkelem'}
          type="checkbox"
          autoComplete="off"
          name={inputName}
          value={value}
          onClick={e => this.onClick(e)}
        />
        {circleName}
        {circleIcon}
      </label>
    );
  }
}

SearchCircle.propTypes = {
  value: PropTypes.string.isRequired,
  inputName: PropTypes.string.isRequired,
  circleName: PropTypes.string.isRequired,
  clickCircle: PropTypes.func.isRequired,
  allChecked: PropTypes.bool.isRequired,
};

export default SearchCircle;

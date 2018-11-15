import React, { Component } from 'react';

class ResultFilterItem extends Component {
  render() {
    const props = this.props;
    return (
      <span>
        <label key={this.props.value} className={this.props.active === this.props.value ? 'active' : null}>
          {"\n            "}
          <input onClick={(e) => { props.clickHandler(props.value);}} className="chkone sort_button" type="checkbox" autocomplete="off" name="sort" value={this.props.value} />{` ${this.props.name}\n            `}
          <span className="fa-stack fa-lg">
            {"\n              "}
            <i className="fa fa-circle-o fa-stack-2x" />
            {"\n              "}
            <i className="fa fa-check fa-stack-1x" />
            {"\n            "}
          </span>
          {"\n          "}
        </label>
        {"\n\n          "}
      </span>
    );
  }
}

export default ResultFilterItem;
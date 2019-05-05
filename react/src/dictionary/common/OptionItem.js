import React, { Component } from 'react';

class OptionItem extends Component {
  render() {
    const props = this.props;
    let className = this.props.chkall ? "chkall" : "chkelem";
    if(this.props.radio) {
      className = 'chkone '+className;
    }
    return (

      <span>
        <label key={this.props.value} className={this.props.selection.includes(this.props.value) ? 'active' : null}>
          {"\n            "}
          <input onClick={(e)=>{this.props.clickHandler(this.props.value)}} checked={this.props.selection.includes(this.props.value)} className={className} type="checkbox" autocomplete="off" name={this.props.typeName} value={this.props.value} />{` ${this.props.name}\n            `}
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

export default OptionItem;
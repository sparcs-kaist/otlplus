import React, { Component } from 'react';
import Option from './Option';

class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  render() {
    console.log(this.state.open);
    return (
      <div>
        <form role="form" className="hid row search_form" style={{minWidth: 260}}>
          <div className="search_bar col-xs-24 col-sm-14 col-md-16 col-lg-18">
            <input id="keyword2" type="text" name="q" autocomplete="on" className="form-control"
                   placeholder="Search"/>
          </div>
          <div onClick={()=> {this.setState((prevState) => {return {open: !prevState.open}})}} className="search_bar col-xs-12 col-sm-5 col-md-4 col-lg-3">
            <div id="option2" type="button" className="btn btn-lg btn-block btn-danger">
              필터
            </div>
          </div>
          <div className="search_bar col-xs-12 col-sm-5 col-md-4 col-lg-3">
            <input type="submit" className="btn btn-lg btn-block btn-danger" formaction="/review/result" value="검색"/>
          </div>

        </form>
        <Option active={this.state.open} />
      </div>
    )
  }
}

export default Form;
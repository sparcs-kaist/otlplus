import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';

import Header from "../common/Header";

import ResultFilter from './common/ResultFilter';
import ResultFilterItem from './common/ResultFilterItem';
import Review from './common/Review';
import Form from './common/Form';

import axios from './../common/presetAxios';

import { BASE_URL } from './../constants';

class LatestPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reviewList: [],
      isLoading: false,
      active: null,
      page: 1,
      hasNext: false,
    };
    this.loadNew = this.loadNew.bind(this);
    this.changeCategory = this.changeCategory.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if(!this.props.bottom && nextProps.bottom) {
      this.loadNew();
      console.log('hi');
    }
  }

  componentWillMount() {
    console.log(this.props);
    this.setState({
      isLoading: true
    });
    axios.get(`${BASE_URL}api/review/latest/1?filter=ALL`).
    then((response) =>{
      console.log(response);
      this.setState({
        isLoading: false,
      });
      if(response.data.results && response.data.results.length > 0) {
        this.setState({
          active: 'ALL',
          hasNext: response.data.hasNext,
          reviewList: response.data.results,
        });
      }
    }).
    catch((response) => {
      console.log(response);
      this.setState({
        isLoading: false,
      });
    });
  }

  changeCategory(filter) {
    console.log(filter);
    this.setState({
      isLoading: true
    });
    axios.get(`${BASE_URL}api/review/latest/1?filter=${filter}`).
    then((response) =>{
      console.log(response);
      this.setState({
        isLoading: false,
      });
      if(response.data.results && response.data.results.length > 0) {
        this.setState({
          active: filter,
          hasNext: response.data.hasNext,
          page: 1,
          reviewList: response.data.results,
        });
      } else {
        this.setState({
          active: filter,
          page: 1,
          reviewList: [],
        });
      }
    }).
    catch((response) => {
      this.setState({
        isLoading: false,
        reviewList: [],
      });
    });
  }

  loadNew() {
    this.setState({
      isLoading: true
    });
    axios.get(`${BASE_URL}api/review/latest/${this.state.page + 1}?filter=${this.state.active}`).
    then((response) =>{
      console.log(response);
      this.setState({
        isLoading: false,
      });
      if(response.data.results && response.data.results.length > 0) {
        this.setState((prevState) => {
          return {
            page: prevState.page + 1,
            hasNext: response.data.hasNext,
            reviewList: prevState.reviewList.concat(response.data.results),
          };
        });
        this.props.unbindBottom();
      } else {
        this.setState({
          reviewList: [],
        });
      }
    }).
    catch((response) => {
      this.setState({
        isLoading: false,
        reviewList: [],
      });
    });
  }

  render() {
    const review_list = this.state.reviewList;
    const reviews = review_list.map((e) => {
      return (
        <Review user={this.props.user} review={e} />
      )
    });
    return (
      <div className="row">
        <div
          className="col-xs-22 col-xs-offset-1 col-sm-20 col-sm-offset-2 col-md-18 col-md-offset-3 col-lg-16 col-lg-offset-4">

          <Form />

          <div className="clearfix"/>
          <div className="list-group sort_result" id="{{ sort_id }}" role="tablist">
            {
              !this.state.isLoading && this.state.reviewList.length === 0 ?
                null
                :
                <ResultFilter>
                  <ResultFilterItem clickHandler={this.changeCategory} active={this.state.active} name="전체" value="ALL"/>
                  <ResultFilterItem clickHandler={this.changeCategory} active={this.state.active} name="교양" value="HSS"/>
                  <ResultFilterItem clickHandler={this.changeCategory} active={this.state.active} name="관심" value="F"/>
                </ResultFilter>
            }

            {
              !this.state.isLoading && this.state.reviewList.length === 0 ?
                <div className="list-group-item" style={{borderRadius: 4, marginTop: 20}}>
                  등록된 후기가 없습니다.
                </div>
                :
                null
            }

            {reviews}
            <div id="datacall"/>
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(LatestPage);

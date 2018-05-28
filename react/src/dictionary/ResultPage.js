import React, {Component} from 'react';
import axios from '../common/presetAxios';
import 'bootstrap';
import { withRouter } from 'react-router-dom';
import { parse, stringify } from 'query-string';

import ResultFilter from './common/ResultFilter';
import ResultFilterItem from './common/ResultFilterItem';
import Course from './common/Course';
import Review from './common/Review';
import Expectation from './common/Expectation';
import FormResult from './common/FormResult';

import { BASE_URL } from './../constants';

import '../static/css/global.css';
import '../static/css/components/header/result.css';
import '../static/css/review/components/option.css';
import '../static/css/review/components/filter.css';
import '../static/css/review/components/expect.css';
import '../static/css/review/components/course.css';
import '../static/css/review/components/review.css';
import '../static/css/review/result.css';

class ResultPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      courseList: [],
      sort: null,
      expectation_loading: false,
      result_loading: false,
      hasNext: false,
      page: 1,
      expectations: [],
    };
    this.changeSort = this.changeSort.bind(this);
    this.loadNew = this.loadNew.bind(this);
  }

  componentWillMount() {
    const query = parse(this.props.location.search);
    console.log(query);
    console.log(stringify(query));
    if('q' in query) {
      this.setState({
        expectation_loading: true,
      });
      axios.get(`${BASE_URL}api/review/result?q=${query.q}`).
        then((res) => {
          console.log(res);
          this.setState({
            expectation_loading: false,
          });
          if(res.data.expectations) {
            this.setState({
              expectations: res.data.expectations,
            });
          }
        }).
        catch((res) => {
          this.setState({
            expectation_loading: false,
          });
          console.log(res);
        });
    }
    this.setState({
      result_loading: true,
    });
    axios.get(`${BASE_URL}api/review/result/1?${stringify(query)}`).
      then((res) => {
        console.log(res);
        this.setState({
          result_loading: false,
        });
        if(res.data && res.data.results) {
          this.setState({
            courseList: res.data.results,
            hasNext: res.data.hasNext,
            sort: 'code',
          });
        }
        console.log(this.state);
      }).
      catch((res) => {
        this.setState({
          result_loading: false,
        });
        console.log(res);
      });
  }

  componentWillReceiveProps(nextProps) {
    if(!this.props.bottom && nextProps.bottom) {
      this.loadNew();
    }
  }

  loadNew() {
    this.setState({
      result_loading: true,
    });
    const query = parse(this.props.location.search);
    query.sort = this.state.sort;
    axios.get(`${BASE_URL}api/review/result/${this.state.page + 1}?${stringify(query)}`).
    then((res) => {
      console.log(res);
      this.setState({
        result_loading: false,
      });
      if(res.data && res.data.results) {
        this.setState((prevState) => {
          return {
            courseList: prevState.courseList.concat(res.data.results),
            page: prevState.page + 1,
            hasNext: res.data.hasNext,
          };
        });
        this.props.unbindBottom();
      }
      console.log(this.state);
    }).
    catch((res) => {
      this.setState({
        result_loading: false,
      });
    });
  }

  changeSort(filter) {
    const query = parse(this.props.location.search);
    query.sort = filter;
    console.log(query);
    console.log(stringify(query));
    if('q' in query) {
      this.setState({
        expectation_loading: true,
      });
      axios.get(`${BASE_URL}api/review/result?q=${query.q}`).
      then((res) => {
        console.log(res);
        this.setState({
          expectation_loading: false,
        });
        if(res.data.expectations) {
          this.setState({
            expectations: res.data.expectations,
          });
        }
      }).
      catch((res) => {
        this.setState({
          expectation_loading: false,
        });
        console.log(res);
      });
    }
    this.setState({
      result_loading: true,
    });
    axios.get(`${BASE_URL}api/review/result/1?${stringify(query)}`).
    then((res) => {
      console.log(res);
      this.setState({
        page: 1,
        result_loading: false,
      });
      if(res.data && res.data.results) {
        this.setState({
          courseList: res.data.results,
          hasNext: res.data.hasNext,
          sort: filter,
        });
      }
      console.log(this.state);
    }).
    catch((res) => {
      this.setState({
        result_loading: false,
      });
      console.log(res);
    });
  }

  render() {
    const course_list = this.state.courseList;
    const courses = course_list.map((e) => {
      return (
        <Course course={e} />
      );
    });
    return (
      <div className="row">
        <div
          className="col-xs-22 col-xs-offset-1 col-sm-20 col-sm-offset-2 col-md-18 col-md-offset-3 col-lg-16 col-lg-offset-4">
          <FormResult />

          <div className="list-group sort_result" id="{{ sort_id }}" role="tablist">
            {
              !this.state.result_loading && this.state.courseList.length ===0 ?
                (!this.state.expectation_loading && this.state.expectations.length ===0 ?
                  <div className="list-group-item" style={{borderRadius:4, marginTop:20}} >
                    검색 결과가 없습니다.
                  </div>
                  :
                  null)
                :
                <ResultFilter>
                  <ResultFilterItem clickHandler={this.changeSort} active={this.state.sort} name="코드순" value="code"/>
                  <ResultFilterItem clickHandler={this.changeSort} active={this.state.sort} name="이름순" value="name"/>
                  <ResultFilterItem clickHandler={this.changeSort} active={this.state.sort} name="평점순" value="total"/>
                  <ResultFilterItem clickHandler={this.changeSort} active={this.state.sort} name="성적순" value="grade"/>
                  <ResultFilterItem clickHandler={this.changeSort} active={this.state.sort} name="널널순" value="load"/>
                  <ResultFilterItem clickHandler={this.changeSort} active={this.state.sort} name="강의순" value="speech"/>
                </ResultFilter>
            }

            {
              !this.state.expectation_loading && this.state.expectations.length !== 0 ?
                <Expectation data={{
                  expectations: this.state.expectations
                }}/> :
                null
            }
            <div className="clearfix"></div>
            { courses }
            {/*<Review user={this.props.user} comment={"학점은 아직 받지 않았습니다만, 솔직히 그렇게 좋을 것 같지는 않아 보이네요 \n일단 교수님이 나쁘거나 그러시진 않지만, 과목 자체가 정말 풀타임으로 이 과목에 모든 노력을 쏟길 원합니다. 특히 쓸 데 없는 특허 명세서 작성이나 각종 발표 준비는 너무나 많은 시간을 소모하고 말았네요.\r\n\r\n개인적으로는 최옥주교수님보다는 김명철 교수님이나 최호진 교수님이 빨리 바뀌셨으면 좋겠다는 생각이 들었습니다."} />*/}
            <div id="datacall"></div>
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(ResultPage);

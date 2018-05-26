import React, { Component } from 'react';
import axios from '../common/presetAxios';
import 'bootstrap';

import ResultFilter from './common/ResultFilter';
import ResultFilterItem from './common/ResultFilterItem';
import Course from './common/Course';
import Review from './common/Review';
import Expectation from './common/Expectation';

import '../static/css/global.css';
import '../static/css/components/header/result.css';
import '../static/css/review/components/option.css';
import '../static/css/review/components/filter.css';
import '../static/css/review/components/expect.css';
import '../static/css/review/components/course.css';
import '../static/css/review/components/review.css';
import '../static/css/review/result.css';

class ResultPage extends Component {
    componentWillMount() {
      // console.log(this.props);
      // console.log('hi');
      // axios.request({
      //   method: 'get',
      //   url: 'http://localhost:17322/api/review/result',
      //   body: JSON.stringify({
      //     q: '김'
      //   })
      // }).then((response)=> {
      //   console.log(response);
      // });
      axios.get('http://localhost:17322/api/review/result?q=김').then((response)=> {
          console.log(response);
        });
      // axios.get('http://localhost:17322/api/review/course/751/14/1')
      //   .then((response)=> {
      //     console.log(response.data.results[0]);
      //   }).catch((response => {
      //     console.log(response);
      // }));
    }

  componentWillReceiveProps(nextProps) {
    console.log('hi1');
  }
    render() {
      return (
        <div className="row">
          <div className="col-xs-22 col-xs-offset-1 col-sm-20 col-sm-offset-2 col-md-18 col-md-offset-3 col-lg-16 col-lg-offset-4">
            <form role="form" className="row search_form">
              <div className="hid search_bar col-xs-24 col-sm-14 col-md-16 col-lg-18">
                <input id="keyword2" type="text" name="q" autocomplete="on" className="form-control" placeholder="Search" />
              </div>
              <div className="hid search_bar col-xs-12 col-sm-5 col-md-4 col-lg-3">
                <div id="option2" type="button" className="btn btn-lg btn-block btn-danger">
                  필터
                </div>
              </div>
              <div className="hid search_bar col-xs-12 col-sm-5 col-md-4 col-lg-3">
                <input type="submit" className="btn btn-lg btn-block btn-danger" formaction = "/review/result" value="검색" />
              </div>
              % if keyword|length == 0 %
              % include 'review/components/option.html' with with_filter=True %
              % else %
              % include 'review/components/option.html' %
              % endif %
            </form>
            
            <div className="list-group sort_result" id="{{ sort_id }}" role="tablist">
              <div className="list-group-item" style={{borderRadius:4, marginTop:20}} >
                검색 결과가 없습니다.
              </div>
              <ResultFilter>
                <ResultFilterItem name="코드순" value="code"/>
                <ResultFilterItem name="이름순" value="name" />
                <ResultFilterItem name="평점순" value="total" />
                <ResultFilterItem name="성적순" value="grade" />
                <ResultFilterItem name="널널순" value="load" />
                <ResultFilterItem name="강의순" value="speech" />
              </ResultFilter>
              <Expectation data={{expectations: [{name: "김정원", id: 2}, {name: "김정원", id: 2}, {name: "김정원", id: 2}, {name: "김정원", id: 2},]}} />
              <div className="clearfix"></div>
              <Course />
              {/*<Review user={this.props.user} comment={"학점은 아직 받지 않았습니다만, 솔직히 그렇게 좋을 것 같지는 않아 보이네요 \n일단 교수님이 나쁘거나 그러시진 않지만, 과목 자체가 정말 풀타임으로 이 과목에 모든 노력을 쏟길 원합니다. 특히 쓸 데 없는 특허 명세서 작성이나 각종 발표 준비는 너무나 많은 시간을 소모하고 말았네요.\r\n\r\n개인적으로는 최옥주교수님보다는 김명철 교수님이나 최호진 교수님이 빨리 바뀌셨으면 좋겠다는 생각이 들었습니다."} />*/}
              <div id="datacall"></div>
            </div>
          </div>
        </div>
      )
    }
}

export default ResultPage;

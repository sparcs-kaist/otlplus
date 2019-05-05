import React, { Component } from 'react';

import Header from "./Header";
import Footer from "./Footer";

import './../static/css/credits.css';

class Button extends Component {
    render() {
        let className;
        if(this.props.index === this.props.current) {
            className = "block active";
        } else {
            className = "block";
        }
        return (
          <div onClick={() => { this.props.onClick(this.props.index) }} className={className} key={this.props.index}>{this.props.children}</div>
        );
    }
}

class CreditPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTab: 6,
        };
        this.changePage = this.changePage.bind(this);
    }
    changePage(index) {
        this.setState({
          currentTab: index,
        });
    }
    render() {
        let content = (
          <div className="content tab6">
              <h4>Project Manager</h4>
              <div className="people">
                  김재성
                  <div>(2016.09 ~ 2017.05)</div>
              </div>
              <div className="people">
                  한승현
                  <div>(2017.06 ~ )</div>
              </div>

              <h4>Designer</h4>
              <div className="people">한승현</div>

              <h4>Developer</h4>
              <div className="people">고지훈</div>
              <div className="people">김재성</div>
              <div className="people">김태준</div>
              <div className="people">서덕담</div>
              <div className="people">오종훈</div>
              <div className="people">이강원</div>
              <div className="people">조형준</div>
              <div className="people">최정운</div>
              <div className="people">한승현</div>
          </div>
        );
        switch(this.state.currentTab) {
          case 1:
              content = (
                <div className="content tab1">
                    <h4>Project Manager</h4>

                    <h4>Designer</h4>

                    <h4>Developer</h4>
                </div>
              );
              break;
          case 2:
              content = (
                <div className="content tab2">
                    <h4>Developer</h4>
                    <div className="people">김민우</div>
                    <div className="people">김종균</div>
                    <div className="people">김준기</div>
                    <div className="people">유충국</div>

                    <h4>Special Thanks To</h4>
                    <div className="people">강철</div>
                    <div className="people">안병욱</div>
                </div>
              );
              break;
          case 3:
              content = (
                <div className="content tab3">
                    <h4>Project Manager</h4>
                    <div className="people">
                        배성경
                        <div>(2011)</div>
                    </div>
                    <div className="people">
                        김재겸
                        <div>(2012)</div>
                    </div>

                    <h4>Developer</h4>
                    <div className="people">김재겸</div>
                    <div className="people">박일우</div>
                    <div className="people">배성경</div>
                    <div className="people">안재만</div>
                    <div className="people">이윤석</div>
                    <div className="people">정재성</div>
                    <div className="people">조유정</div>
                </div>
              );
              break;
          case 4:
            content = (
              <div className="content tab4">
                  <h4>Project Manager</h4>
                  <div className="people">
                      유민정
                      <div>(2012.05 ~ 2012.09)</div>
                  </div>
                  <div className="people">
                      마재의
                      <div>(2012.09 ~ 2013.03)</div>
                  </div>

                  <h4>Designer</h4>
                  <div className="people">박지향</div>

                  <h4>Developer</h4>
                  <div className="people">김정민</div>
                  <div className="people">마재의</div>
                  <div className="people">박중언</div>
                  <div className="people">박지혁</div>
                  <div className="people">유민정</div>
                  <div className="people">윤필립</div>
                  <div className="people">이태현</div>
                  <div className="people">정종혁</div>
                  <div className="people">정창제</div>
                  <div className="people">채종욱</div>
              </div>
            );
            break;
          case 5:
            content = (
              <div className="content tab5">
                  <h4>Project Manager</h4>
                  <div className="people">
                      황태현
                      <div>(2015.09 ~ 2015.11)</div>
                  </div>
                  <div className="people">
                      서동민
                      <div>(2015.12 ~ 2016.06)</div>
                  </div>

                  <h4>Designer</h4>
                  <div className="people">김찬욱</div>

                  <h4>Developer</h4>
                  <div className="people">고지훈</div>
                  <div className="people">김강인</div>
                  <div className="people">김재성</div>
                  <div className="people">서동민</div>
                  <div className="people">이강원</div>
                  <div className="people">조성원</div>
                  <div className="people">최정운</div>
                  <div className="people">한승현</div>
                  <div className="people">황태현</div>
              </div>
            );
            break;
          case 6:
            content = (
              <div className="content tab6">
                  <h4>Project Manager</h4>
                  <div className="people">
                      김재성
                      <div>(2016.09 ~ 2017.05)</div>
                  </div>
                  <div className="people">
                      한승현
                      <div>(2017.06 ~ )</div>
                  </div>

                  <h4>Designer</h4>
                  <div className="people">한승현</div>

                  <h4>Developer</h4>
                  <div className="people">고지훈</div>
                  <div className="people">김재성</div>
                  <div className="people">김태준</div>
                  <div className="people">서덕담</div>
                  <div className="people">오종훈</div>
                  <div className="people">이강원</div>
                  <div className="people">조형준</div>
                  <div className="people">최정운</div>
                  <div className="people">한승현</div>
              </div>
            );
            break;
          case 7:
            content = (
              <div className="content tab7">
                  <h4>LKIN</h4>
                  <div className="people">
                      서창민
                      <div>(2009 ~ 2010)</div>
                  </div>
                  <div className="people">
                      이근홍
                      <div>(2011 ~ 2012)</div>
                  </div>

                  <h4>OTL</h4>
                  <div className="people">
                      배성경
                      <div>(2011)</div>
                  </div>
                  <div className="people">
                      김재겸
                      <div>(2012)</div>
                  </div>
                  <div className="people">
                      유민정
                      <div>(2012.05 ~ 2012.09)</div>
                  </div>
                  <div className="people">
                      마재의
                      <div>(2012.09 ~ 2015.04)</div>
                  </div>
                  <div className="people">
                      황태현
                      <div>(2015.05 ~ 2015.11)</div>
                  </div>
                  <div className="people">
                      서동민
                      <div>(2015.12 ~ 2016.05)</div>
                  </div>
                  <div className="people">
                      김재성
                      <div>(2016.06 ~ 2017.06)</div>
                  </div>

                  <h4>OTL PLUS</h4>
                  <div className="people">
                      한승현
                      <div>(2017.06 ~ )</div>
                  </div>
              </div>
            );
            break;
        }
        return (
          <div className="credit">
              <Header user={this.props.user} />
              <section id="contents" className="container-fluid">
                  <div className="row">
                      <div className="col-xs-22 col-xs-offset-1 col-sm-20 col-sm-offset-2 col-md-18 col-md-offset-3 col-lg-16 col-lg-offset-4">

                          <div className="list-group sort_result" >
                              <div className="list-group-item" style={{ borderRadius:4, marginTop:20, textAlign:'center', padding:"20px 50px 20px 50px" }}>

                                  <div className="block_wrap">
                                      <Button index={1} onClick={this.changePage} current={this.state.currentTab}>LKIN</Button>
                                      <Button index={2} onClick={this.changePage} current={this.state.currentTab}>OTL<br />모의시간표</Button>
                                      <Button index={3} onClick={this.changePage} current={this.state.currentTab}>OTL<br />추가개발</Button>
                                      <Button index={4} onClick={this.changePage} current={this.state.currentTab}>OTL<br />과목사전</Button>
                                      <Button index={5} onClick={this.changePage} current={this.state.currentTab}>OTL PLUS<br />과목사전</Button>
                                      <Button index={6} onClick={this.changePage} current={this.state.currentTab}>OTL PLUS<br />모의시간표</Button>
                                      <Button index={7} onClick={this.changePage} current={this.state.currentTab}>SYSOP</Button>
                                      <div className="dummy" />
                                      <div className="dummy" />
                                      <div className="dummy" />
                                      <div className="dummy" />
                                      <div className="dummy" />
                                      <div className="dummy" />
                                  </div>

                                  <h1>Credit</h1>
                                {content}
                              </div>
                          </div>
                      </div>
                  </div>
              </section>
              <Footer />
          </div>
        );
    }
}

export default CreditPage;

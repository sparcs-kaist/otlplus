import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { creditBoundClassNames, appBoundClassNames as classNames } from '../common/boundClassNames';

import Footer from '../components/guideline/Footer';

class Button extends Component {
  render() {
    const { index, current, onClick, children } = this.props;
    const className = (index === current)
      ? creditBoundClassNames('block', 'active')
      : creditBoundClassNames('block');
    return (
      <div onClick={() => onClick(index)} className={className} key={index}>
        {children}
      </div>
    );
  }
}

Button.propTypes = {
  index: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  current: PropTypes.number.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.element,
    ])),
    PropTypes.string,
    PropTypes.element,
  ]).isRequired,
};

// eslint-disable-next-line react/no-multi-comp
class CreditPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: 6,
    };
  }

  changePage = (index) => {
    this.setState({
      currentTab: index,
    });
  }

  _getContent = (tab) => {
    switch (tab) {
      case 1:
        return (
          <div className={creditBoundClassNames('content', 'tab1')}>
            <h4>Project Manager</h4>

            <h4>Designer</h4>

            <h4>Developer</h4>
          </div>
        );
      case 2:
        return (
          <div className={creditBoundClassNames('content', 'tab2')}>
            <h4>Developer</h4>
            <div className={creditBoundClassNames('people')}>김민우</div>
            <div className={creditBoundClassNames('people')}>김종균</div>
            <div className={creditBoundClassNames('people')}>김준기</div>
            <div className={creditBoundClassNames('people')}>유충국</div>

            <h4>Special Thanks To</h4>
            <div className={creditBoundClassNames('people')}>강철</div>
            <div className={creditBoundClassNames('people')}>안병욱</div>
          </div>
        );
      case 3:
        return (
          <div className={creditBoundClassNames('content', 'tab3')}>
            <h4>Project Manager</h4>
            <div className={creditBoundClassNames('people')}>
              배성경
              <div>(2011)</div>
            </div>
            <div className={creditBoundClassNames('people')}>
              김재겸
              <div>(2012)</div>
            </div>

            <h4>Developer</h4>
            <div className={creditBoundClassNames('people')}>김재겸</div>
            <div className={creditBoundClassNames('people')}>박일우</div>
            <div className={creditBoundClassNames('people')}>배성경</div>
            <div className={creditBoundClassNames('people')}>안재만</div>
            <div className={creditBoundClassNames('people')}>이윤석</div>
            <div className={creditBoundClassNames('people')}>정재성</div>
            <div className={creditBoundClassNames('people')}>조유정</div>
          </div>
        );
      case 4:
        return (
          <div className={creditBoundClassNames('content', 'tab4')}>
            <h4>Project Manager</h4>
            <div className={creditBoundClassNames('people')}>
              유민정
              <div>(2012.05 ~ 2012.09)</div>
            </div>
            <div className={creditBoundClassNames('people')}>
              마재의
              <div>(2012.09 ~ 2013.03)</div>
            </div>

            <h4>Designer</h4>
            <div className={creditBoundClassNames('people')}>박지향</div>

            <h4>Developer</h4>
            <div className={creditBoundClassNames('people')}>김정민</div>
            <div className={creditBoundClassNames('people')}>마재의</div>
            <div className={creditBoundClassNames('people')}>박중언</div>
            <div className={creditBoundClassNames('people')}>박지혁</div>
            <div className={creditBoundClassNames('people')}>유민정</div>
            <div className={creditBoundClassNames('people')}>윤필립</div>
            <div className={creditBoundClassNames('people')}>이태현</div>
            <div className={creditBoundClassNames('people')}>정종혁</div>
            <div className={creditBoundClassNames('people')}>정창제</div>
            <div className={creditBoundClassNames('people')}>채종욱</div>
          </div>
        );
      case 5:
        return (
          <div className={creditBoundClassNames('content', 'tab5')}>
            <h4>Project Manager</h4>
            <div className={creditBoundClassNames('people')}>
              황태현
              <div>(2015.09 ~ 2015.11)</div>
            </div>
            <div className={creditBoundClassNames('people')}>
              서동민
              <div>(2015.12 ~ 2016.06)</div>
            </div>

            <h4>Designer</h4>
            <div className={creditBoundClassNames('people')}>김찬욱</div>

            <h4>Developer</h4>
            <div className={creditBoundClassNames('people')}>고지훈</div>
            <div className={creditBoundClassNames('people')}>김강인</div>
            <div className={creditBoundClassNames('people')}>김재성</div>
            <div className={creditBoundClassNames('people')}>서동민</div>
            <div className={creditBoundClassNames('people')}>이강원</div>
            <div className={creditBoundClassNames('people')}>조성원</div>
            <div className={creditBoundClassNames('people')}>최정운</div>
            <div className={creditBoundClassNames('people')}>한승현</div>
            <div className={creditBoundClassNames('people')}>황태현</div>
          </div>
        );
      case 6:
        return (
          <div className={creditBoundClassNames('content', 'tab6')}>
            <h4>Project Manager</h4>
            <div className={creditBoundClassNames('people')}>
              김재성
              <div>(2016.09 ~ 2017.05)</div>
            </div>
            <div className={creditBoundClassNames('people')}>
              한승현
              <div>(2017.06 ~ )</div>
            </div>

            <h4>Designer</h4>
            <div className={creditBoundClassNames('people')}>한승현</div>

            <h4>Developer</h4>
            <div className={creditBoundClassNames('people')}>고지훈</div>
            <div className={creditBoundClassNames('people')}>김재성</div>
            <div className={creditBoundClassNames('people')}>김태준</div>
            <div className={creditBoundClassNames('people')}>서덕담</div>
            <div className={creditBoundClassNames('people')}>오종훈</div>
            <div className={creditBoundClassNames('people')}>이강원</div>
            <div className={creditBoundClassNames('people')}>조형준</div>
            <div className={creditBoundClassNames('people')}>최정운</div>
            <div className={creditBoundClassNames('people')}>한승현</div>
          </div>
        );
      case 7:
        return (
          <div className={creditBoundClassNames('content', 'tab7')}>
            <h4>LKIN</h4>
            <div className={creditBoundClassNames('people')}>
              서창민
              <div>(2009 ~ 2010)</div>
            </div>
            <div className={creditBoundClassNames('people')}>
              이근홍
              <div>(2011 ~ 2012)</div>
            </div>

            <h4>OTL</h4>
            <div className={creditBoundClassNames('people')}>
              배성경
              <div>(2011)</div>
            </div>
            <div className={creditBoundClassNames('people')}>
              김재겸
              <div>(2012)</div>
            </div>
            <div className={creditBoundClassNames('people')}>
              유민정
              <div>(2012.05 ~ 2012.09)</div>
            </div>
            <div className={creditBoundClassNames('people')}>
              마재의
              <div>(2012.09 ~ 2015.04)</div>
            </div>
            <div className={creditBoundClassNames('people')}>
              황태현
              <div>(2015.05 ~ 2015.11)</div>
            </div>
            <div className={creditBoundClassNames('people')}>
              서동민
              <div>(2015.12 ~ 2016.05)</div>
            </div>
            <div className={creditBoundClassNames('people')}>
              김재성
              <div>(2016.06 ~ 2017.06)</div>
            </div>

            <h4>OTL PLUS</h4>
            <div className={creditBoundClassNames('people')}>
              한승현
              <div>(2017.06 ~ )</div>
            </div>
          </div>
        );
      default:
        return (
          <div />
        );
    }
  }

  render() {
    const { currentTab } = this.state;
    return (
      <section className={classNames('content', 'content--no-scroll')}>
        <div className={classNames('section-wrap', 'section-wrap--full')}>
          <div className={classNames('section')}>
            {/* eslint-disable-next-line react/jsx-indent */}
                <div className={classNames('section-content', 'section-content--credit')}>
                  <div className={creditBoundClassNames('block_wrap')}>
                    <Button index={1} onClick={this.changePage} current={currentTab}>
                      LKIN
                    </Button>
                    <Button index={2} onClick={this.changePage} current={currentTab}>
                      OTL
                      <br />
                      모의시간표
                    </Button>
                    <Button index={3} onClick={this.changePage} current={currentTab}>
                      OTL
                      <br />
                      추가개발
                    </Button>
                    <Button index={4} onClick={this.changePage} current={currentTab}>
                      OTL
                      <br />
                      과목사전
                    </Button>
                    <Button index={5} onClick={this.changePage} current={currentTab}>
                      OTL PLUS
                      <br />
                      과목사전
                    </Button>
                    <Button index={6} onClick={this.changePage} current={currentTab}>
                      OTL PLUS
                      <br />
                      모의시간표
                    </Button>
                    <Button index={7} onClick={this.changePage} current={currentTab}>
                      SYSOP
                    </Button>
                    <div className={creditBoundClassNames('dummy')} />
                    <div className={creditBoundClassNames('dummy')} />
                    <div className={creditBoundClassNames('dummy')} />
                    <div className={creditBoundClassNames('dummy')} />
                    <div className={creditBoundClassNames('dummy')} />
                    <div className={creditBoundClassNames('dummy')} />
                  </div>

                  <h1>Credit</h1>
                  {this._getContent(currentTab)}
                </div>
          </div>
        </div>
      </section>
    );
  }
}

export default CreditPage;

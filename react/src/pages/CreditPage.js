import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

import Footer from '../components/guideline/Footer';

class Button extends Component {
  render() {
    const { index, current, onClick, children } = this.props;
    const className = (index === current)
      ? classNames('block', 'block--project', 'active')
      : classNames('block', 'block--project');
    return (
      <button onClick={() => onClick(index)} className={className} key={index}>
        {children}
      </button>
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
          <div className={classNames('section-content--credit__people-list')}>
            <div className={classNames('title')}>Project Manager</div>

            <div className={classNames('title')}>Designer</div>

            <div className={classNames('title')}>Developer</div>
          </div>
        );
      case 2:
        return (
          <div className={classNames('section-content--credit__people-list')}>
            <div className={classNames('title')}>Developer</div>
            <div className={classNames()}>김민우</div>
            <div className={classNames()}>김종균</div>
            <div className={classNames()}>김준기</div>
            <div className={classNames()}>유충국</div>

            <div className={classNames('title')}>Special Thanks To</div>
            <div className={classNames()}>강철</div>
            <div className={classNames()}>안병욱</div>
          </div>
        );
      case 3:
        return (
          <div className={classNames('section-content--credit__people-list')}>
            <div className={classNames('title')}>Project Manager</div>
            <div className={classNames()}>
              배성경
              <div className={classNames('caption')}>(2011)</div>
            </div>
            <div className={classNames()}>
              김재겸
              <div className={classNames('caption')}>(2012)</div>
            </div>

            <div className={classNames('title')}>Developer</div>
            <div className={classNames()}>김재겸</div>
            <div className={classNames()}>박일우</div>
            <div className={classNames()}>배성경</div>
            <div className={classNames()}>안재만</div>
            <div className={classNames()}>이윤석</div>
            <div className={classNames()}>정재성</div>
            <div className={classNames()}>조유정</div>
          </div>
        );
      case 4:
        return (
          <div className={classNames('section-content--credit__people-list')}>
            <div className={classNames('title')}>Project Manager</div>
            <div className={classNames()}>
              유민정
              <div className={classNames('caption')}>(2012.05 ~ 2012.09)</div>
            </div>
            <div className={classNames()}>
              마재의
              <div className={classNames('caption')}>(2012.09 ~ 2013.03)</div>
            </div>

            <div className={classNames('title')}>Designer</div>
            <div className={classNames()}>박지향</div>

            <div className={classNames('title')}>Developer</div>
            <div className={classNames()}>김정민</div>
            <div className={classNames()}>마재의</div>
            <div className={classNames()}>박중언</div>
            <div className={classNames()}>박지혁</div>
            <div className={classNames()}>유민정</div>
            <div className={classNames()}>윤필립</div>
            <div className={classNames()}>이태현</div>
            <div className={classNames()}>정종혁</div>
            <div className={classNames()}>정창제</div>
            <div className={classNames()}>채종욱</div>
          </div>
        );
      case 5:
        return (
          <div className={classNames('section-content--credit__people-list')}>
            <div className={classNames('title')}>Project Manager</div>
            <div className={classNames()}>
              황태현
              <div className={classNames('caption')}>(2015.09 ~ 2015.11)</div>
            </div>
            <div className={classNames()}>
              서동민
              <div className={classNames('caption')}>(2015.12 ~ 2016.06)</div>
            </div>

            <div className={classNames('title')}>Designer</div>
            <div className={classNames()}>김찬욱</div>

            <div className={classNames('title')}>Developer</div>
            <div className={classNames()}>고지훈</div>
            <div className={classNames()}>김강인</div>
            <div className={classNames()}>김재성</div>
            <div className={classNames()}>서동민</div>
            <div className={classNames()}>이강원</div>
            <div className={classNames()}>조성원</div>
            <div className={classNames()}>최정운</div>
            <div className={classNames()}>한승현</div>
            <div className={classNames()}>황태현</div>
          </div>
        );
      case 6:
        return (
          <div className={classNames('section-content--credit__people-list')}>
            <div className={classNames('title')}>Project Manager</div>
            <div className={classNames()}>
              김재성
              <div className={classNames('caption')}>(2016.09 ~ 2017.05)</div>
            </div>
            <div className={classNames()}>
              한승현
              <div className={classNames('caption')}>(2017.06 ~ )</div>
            </div>

            <div className={classNames('title')}>Designer</div>
            <div className={classNames()}>한승현</div>

            <div className={classNames('title')}>Developer</div>
            <div className={classNames()}>고지훈</div>
            <div className={classNames()}>김재성</div>
            <div className={classNames()}>김태준</div>
            <div className={classNames()}>서덕담</div>
            <div className={classNames()}>오종훈</div>
            <div className={classNames()}>이강원</div>
            <div className={classNames()}>조형준</div>
            <div className={classNames()}>최정운</div>
            <div className={classNames()}>한승현</div>
          </div>
        );
      case 7:
        return (
          <div className={classNames('section-content--credit__people-list')}>
            <div className={classNames('title')}>LKIN</div>
            <div className={classNames()}>
              서창민
              <div className={classNames('caption')}>(2009 ~ 2010)</div>
            </div>
            <div className={classNames()}>
              이근홍
              <div className={classNames('caption')}>(2011 ~ 2012)</div>
            </div>

            <div className={classNames('title')}>OTL</div>
            <div className={classNames()}>
              배성경
              <div className={classNames('caption')}>(2011)</div>
            </div>
            <div className={classNames()}>
              김재겸
              <div className={classNames('caption')}>(2012)</div>
            </div>
            <div className={classNames()}>
              유민정
              <div className={classNames('caption')}>(2012.05 ~ 2012.09)</div>
            </div>
            <div className={classNames()}>
              마재의
              <div className={classNames('caption')}>(2012.09 ~ 2015.04)</div>
            </div>
            <div className={classNames()}>
              황태현
              <div className={classNames('caption')}>(2015.05 ~ 2015.11)</div>
            </div>
            <div className={classNames()}>
              서동민
              <div className={classNames('caption')}>(2015.12 ~ 2016.05)</div>
            </div>
            <div className={classNames()}>
              김재성
              <div className={classNames('caption')}>(2016.06 ~ 2017.06)</div>
            </div>

            <div className={classNames('title')}>OTL PLUS</div>
            <div className={classNames()}>
              한승현
              <div className={classNames('caption')}>(2017.06 ~ )</div>
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
                  <div className={classNames('section-content--credit__blocks')}>
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
                  </div>

                  {this._getContent(currentTab)}
                </div>
          </div>
        </div>
      </section>
    );
  }
}

export default CreditPage;

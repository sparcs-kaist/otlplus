import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

import Footer from '../components/guideline/Footer';

class Button extends Component {
  render() {
    const { index, isClicked, onClick, mainTitle, subTitle, period } = this.props;
    const className = isClicked
      ? classNames('block', 'block--project', 'active')
      : classNames('block', 'block--project');
    return (
      <button onClick={() => onClick(index)} className={className} key={index}>
        <div className={classNames('block--project__title')}>{mainTitle}</div>
        <div className={classNames('block--project__title')}>{subTitle}</div>
        <div className={classNames('block--project__content')}>{`(${period})`}</div>
      </button>
    );
  }
}

Button.propTypes = {
  index: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  isClicked: PropTypes.bool.isRequired,
  mainTitle: PropTypes.string.isRequired,
  subTitle: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
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
        return [
          {
            title: 'Project Manager', people: [],
          }, {
            title: 'Designer', people: [],
          }, {
            title: 'Developer', people: [],
          },
        ];
      case 2:
        return [
          {
            title: 'Developer',
            people: [
              { name: '김민우' },
              { name: '김종균' },
              { name: '김준기' },
              { name: '유충국' },
            ],
          },
          {
            title: 'Special Thanks To',
            people: [
              { name: '강철' },
              { name: '안병욱' },
            ],
          },
        ];
      case 3:
        return [
          {
            title: 'Project Manager',
            people: [
              {
                name: '배성경',
                caption: '2011',
              },
              {
                name: '김재겸',
                caption: '(2012)',
              },
            ],
          },
          {
            title: 'Developer',
            people: [
              { name: '김재겸' },
              { name: '박일우' },
              { name: '배성경' },
              { name: '안재만' },
              { name: '이윤석' },
              { name: '정재성' },
              { name: '조유정' },
            ],
          },
        ];
      case 4:
        return [
          {
            title: 'Project Manager',
            people: [
              {
                name: '유민정',
                caption: '(2012.05 ~ 2012.09)',
              },
              {
                name: '마재의',
                caption: '(2012.09 ~ 2013.03)',
              },
            ],
          },
          {
            title: 'Designer',
            people: [
              { name: '박지향' },
            ],
          },
          {
            title: 'Developer',
            people: [
              { name: '김정민' },
              { name: '마재의' },
              { name: '박중언' },
              { name: '박지혁' },
              { name: '유민정' },
              { name: '윤필립' },
              { name: '이태현' },
              { name: '정종혁' },
              { name: '정창제' },
              { name: '채종욱' },
            ],
          },
        ];
      case 5:
        return [
          {
            title: 'Project Manager',
            people: [
              {
                name: '황태현',
                caption: '(2015.09 ~ 2015.11)',
              },
              {
                name: '서동민',
                caption: '(2015.12 ~ 2016.06)',
              },
            ],
          },
          {
            title: 'Designer',
            people: [
              { name: '김찬욱' },
            ],
          },
          {
            title: 'Developer',
            people: [
              { name: '고지훈' },
              { name: '김강인' },
              { name: '김재성' },
              { name: '서동민' },
              { name: '이강원' },
              { name: '조성원' },
              { name: '최정운' },
              { name: '한승현' },
              { name: '황태현' },
            ],
          },
        ];
      case 6:
        return [
          {
            title: 'Project Manager',
            people: [
              {
                name: '김재성',
                caption: '(2016.09 ~ 2017.05)',
              },
              {
                name: '한승현',
                caption: '(2017.06 ~ )',
              },
            ],
          },
          {
            title: 'Designer',
            people: [
              { name: '한승현' },
            ],
          },
          {
            title: 'Developer',
            people: [
              { name: '고지훈' },
              { name: '김재성' },
              { name: '김태준' },
              { name: '서덕담' },
              { name: '오종훈' },
              { name: '이강원' },
              { name: '조형준' },
              { name: '최정운' },
              { name: '한승현' },
            ],
          },
        ];
      case 7:
        return [
          {
            title: 'LKIN',
            people: [
              {
                name: '서창민',
                caption: '(2009 ~ 2010)',
              },
              {
                name: '이근홍',
                caption: '(2011 ~ 2012)',
              },
            ],
          },
          {
            title: 'OTL',
            people: [
              {
                name: '배성경',
                caption: '(2011)',
              },
              {
                name: '김재겸',
                caption: '(2012)',
              },
              {
                name: '유민정',
                caption: '(2012.05 ~ 2012.09)',
              },
              {
                name: '마재의',
                caption: '(2012.09 ~ 2015.04)',
              },
              {
                name: '황태현',
                caption: '(2015.05 ~ 2015.11)',
              },
              {
                name: '서동민',
                caption: '(2015.12 ~ 2016.05)',
              },
              {
                name: '김재성',
                caption: '(2016.06 ~ 2017.06)',
              },
            ],
          },
          {
            title: 'OTL PLUS',
            people: [
              {
                name: '한승현',
                caption: '(2017.06 ~ )',
              },
            ],
          },
        ];
      default:
        return [];
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
                    <Button index={1} onClick={this.changePage} isClicked={currentTab === 1}
                      mainTitle="LKIN"
                      subTitle="-"
                      period="-"
                    />
                    <Button index={2} onClick={this.changePage} isClicked={currentTab === 2}
                      mainTitle="OTL"
                      subTitle="모의시간표"
                      period="2010"
                    />
                    <Button index={3} onClick={this.changePage} isClicked={currentTab === 3}
                      mainTitle="OTL"
                      subTitle="추가개발"
                      period="2011 ~ 2012"
                    />
                    <Button index={4} onClick={this.changePage} isClicked={currentTab === 4}
                      mainTitle="OTL"
                      subTitle="과목사전"
                      period="2012 ~ 2013"
                    />
                    <Button index={5} onClick={this.changePage} isClicked={currentTab === 5}
                      mainTitle="OTL PLUS"
                      subTitle="과목사전"
                      period="2015.09 ~ 2016.06"
                    />
                    <Button index={6} onClick={this.changePage} isClicked={currentTab === 6}
                      mainTitle="OTL PLUS"
                      subTitle="모의시간표"
                      period="2016.07 ~ 2018.12"
                    />
                    <Button index={7} onClick={this.changePage} isClicked={currentTab === 7}
                      mainTitle="System Operators"
                      subTitle="-"
                      period="-"
                    />
                  </div>

                  <div className={classNames('section-content--credit__people-list')}>
                    {this._getContent(currentTab).map(f => (
                      <>
                        <div className={classNames('title')}>{f.title}</div>
                        {f.people.map(p => (
                          <div className={classNames()}>
                            {p.name}
                            {p.caption ? <div className={classNames('caption')}>{p.caption}</div> : null}
                          </div>
                        ))}
                      </>
                    ))}
                  </div>
                </div>
          </div>
        </div>
      </section>
    );
  }
}

export default CreditPage;

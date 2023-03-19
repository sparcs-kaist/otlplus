/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';
import Scroller from '../../../Scroller';
import Divider from '../../../Divider';
import SearchFilter from '../../../SearchFilter';
import {
  getSemesterOptions, getRetakeOptions,
} from '../../../../common/searchOptions';
import CourseStatus from '../../../CourseStatus';
import CountController from '../../../CountController';
import { getSemesterName } from '../../../../utils/semesterUtils';
import { ItemFocusFrom } from '../../../../reducers/planner/itemFocus';

class CourseCustomizeSubSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedSemester: new Set(['ALL']),
      selectedRetake: new Set(['ALL']),
      basicRequired: 0,
      basicElective: 0,
      majorRequired: 0,
      majorElective: 0,
      secondMajorRequired: 0,
      secondMajorElective: 0,
      totalCredit: 0,
    };
  }

  componentDidUpdate(prevProps) {
    const { itemFocus } = this.props;
    if (!itemFocus.course || !itemFocus.lectures) {
      return;
    }

    if (!prevProps.itemFocus.lectures && itemFocus.lectures) {
      this.initialize2(itemFocus);
    }
  }

  updateCheckedValues = (filterName) => (checkedValues) => {
    this.setState({
      [filterName]: checkedValues,
    });
  }

  updateCredits = (optionName) => (creditValues) => {
    this.setState({
      [optionName]: creditValues,
    });
  }

  initialize = () => {
    this.setState({
      selectedSemester: new Set(['ALL']),
      selectedRetake: new Set(['ALL']),
      basicRequired: 0,
      basicElective: 0,
      generalRequired: 0,
      generalElective: 0,
      majorRequired: 0,
      majorElective: 0,
      secondMajorRequired: 0,
      secondMajorElective: 0,
      totalCredit: 0,
    });
  }

  initialize2 = () => {
    const { t } = this.props;
    const { itemFocus } = this.props;

    const recentLecture = itemFocus.lectures[itemFocus.lectures.length - 1];
    const credit = recentLecture.credit >= 1
      ? recentLecture.credit
      : recentLecture.credit_au;
    const lectureType = itemFocus.course[t('js.property.type')];

    this.setState({
      selectedSemester: new Set(['ALL']),
      selectedRetake: new Set(['ALL']),
      basicRequired: lectureType === '기초필수' ? credit : 0,
      basicElective: lectureType === '기초선택' ? credit : 0,
      generalRequired: lectureType === '교양필수' ? credit : 0,
      generalElective: lectureType === '교양선택' ? credit : 0,
      majorRequired: lectureType === '전공필수' ? credit : 0,
      majorElective: lectureType === '전공선택' ? credit : 0,
      secondMajorRequired: lectureType === '전공필수' ? credit : 0,
      secondMajorElective: lectureType === '전공선택' ? credit : 0,
      totalCredit: 0,
    });
  }


  render() {
    const { t, itemFocus } = this.props;
    const {
      selectedSemester, selectedRetake, totalCredit, basicRequired, basicElective, generalRequired, generalElective, majorRequired, majorElective, secondMajorRequired, secondMajorElective,
    } = this.state;

    const getSubtitle = () => {
      switch (itemFocus.from) {
        case ItemFocusFrom.TABLE_TAKEN:
          return `수강 완료 - ${itemFocus.item.lecture.year} ${getSemesterName(itemFocus.item.lecture.semester)}`;
        case ItemFocusFrom.TABLE_FUTURE:
          return `수강 예정 - ${itemFocus.item.year} ${getSemesterName(itemFocus.item.semester)}`;
        case ItemFocusFrom.TABLE_GENERIC:
          return `수강 예정 - ${itemFocus.item.year} ${getSemesterName(itemFocus.item.semester)}`;
        default:
          return 'Unknown';
      }
    };

    const sectionHead = (
      <>
        <div className={classNames('detail-title-area')}>
          <div className={classNames('title')}>{t('ui.title.lectureInformation')}</div>
          <div className={classNames('subtitle')}>{getSubtitle()}</div>
          <div className={classNames('buttons')}>
            <button type="reset" className={classNames('text-button', 'text-button--right')} onClick={this.initialize}>{t('ui.button.reset')}</button>
          </div>
        </div>
      </>
    );
    const sectionBody = (
      <>
        <Scroller>
          <SearchFilter
            updateCheckedValues={this.updateCheckedValues('selectedSemester')}
            inputName="semester"
            titleName={t('ui.search.semester')}
            options={getSemesterOptions()}
            checkedValues={selectedSemester}
          />
          <SearchFilter
            updateCheckedValues={this.updateCheckedValues('selectedRetake')}
            inputName="retake"
            titleName={t('ui.search.retake')}
            options={getRetakeOptions()}
            checkedValues={selectedRetake}
          />
          <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={true} />
          <CourseStatus
            entries={[
              { name: '전체', info: [{ name: '총학점', controller: <CountController count={totalCredit} updateCount={this.updateCredits('totalCredit')} /> }] },
              {
                name: '기초',
                info: [
                  { name: '기초필수', controller: <CountController count={basicRequired} updateCount={this.updateCredits('basicRequired')} /> },
                  { name: '기초선택', controller: <CountController count={basicElective} updateCount={this.updateCredits('basicElective')} /> },
                ],
              },
              {
                name: '교양',
                info: [
                  { name: '교양필수', controller: <CountController count={generalRequired} updateCount={this.updateCredits('generalRequired')} /> },
                  { name: '교양선택', controller: <CountController count={generalElective} updateCount={this.updateCredits('generalElective')} /> },
                ],
              },
              {
                name: '전공',
                info: [
                  { name: '전공필수', controller: <CountController count={majorRequired} updateCount={this.updateCredits('majorRequired')} /> },
                  { name: '전공선택', controller: <CountController count={majorElective} updateCount={this.updateCredits('majorElective')} /> },
                ],
              },
              {
                name: '복수전공',
                info: [
                  { name: '전공필수', controller: <CountController count={secondMajorRequired} updateCount={this.updateCredits('secondMajorRequired')} /> },
                  { name: '전공선택', controller: <CountController count={secondMajorElective} updateCount={this.updateCredits('secondMajorElective')} /> },
                ],
              },
            ]}
          />
        </Scroller>
      </>

    );

    return (
      <div className={classNames('subsection', 'subsection--course-manage-right')}>
        {sectionHead}
        {sectionBody}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  itemFocus: state.planner.itemFocus,
  selectedListCode: state.planner.list.selectedListCode,
});


export default withTranslation()(
  connect(mapStateToProps)(
    CourseCustomizeSubSection
  )
);

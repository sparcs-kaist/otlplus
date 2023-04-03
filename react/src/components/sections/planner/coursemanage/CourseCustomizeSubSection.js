/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';
import Scroller from '../../../Scroller';
// import Divider from '../../../Divider';
import SearchFilter from '../../../SearchFilter';
// import CourseStatus from '../../../CourseStatus';
// import CountController from '../../../CountController';
import { getSemesterName } from '../../../../utils/semesterUtils';
import { ItemFocusFrom } from '../../../../reducers/planner/itemFocus';
import { getCourseOfItem, getSemesterOfItem } from '../../../../utils/itemUtils';
import { updateItemInPlanner } from '../../../../actions/planner/planner';
import { setItemFocus } from '../../../../actions/planner/itemFocus';


class CourseCustomizeSubSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedSemester: new Set([getSemesterOfItem(props.itemFocus.item) % 2 === 1 ? 'NORMAL' : 'SEASONAL']),
      selectedRetake: new Set(['NORMAL']),
    };
  }

  updateCheckedValuesForSemester = (checkedValues) => {
    const { itemFocus, updateItemInPlannerDispatch, setItemFocusDispatch } = this.props;

    this.setState({
      selectedSemester: checkedValues,
    });

    const selectedSemester = Array.from(checkedValues)[0];
    if (selectedSemester === 'NORMAL' && itemFocus.item.semester % 2 === 0) {
      const newItem = {
        ...itemFocus.item,
        semester: itemFocus.item.semester - 1,
      };
      updateItemInPlannerDispatch(newItem);
      setItemFocusDispatch(newItem, getCourseOfItem(newItem), itemFocus.from, itemFocus.clicked);
    }
    else if (selectedSemester === 'SEASONAL' && itemFocus.item.semester % 2 === 1) {
      const newItem = {
        ...itemFocus.item,
        semester: itemFocus.item.semester + 1,
      };
      updateItemInPlannerDispatch(newItem);
      setItemFocusDispatch(newItem, getCourseOfItem(newItem), itemFocus.from, itemFocus.clicked);
    }
  }

  updateCheckedValuesForRetake = (checkedValues) => {
    this.setState({
      selectedRetake: checkedValues,
    });
  }

  // updateCredits = (optionName) => (creditValues) => {
  //   this.setState({
  //     [optionName]: creditValues,
  //   });
  // }


  render() {
    const { t, itemFocus } = this.props;
    const {
      selectedSemester, selectedRetake,
      // totalCredit, basicRequired, basicElective, generalRequired, generalElective, majorRequired, majorElective, secondMajorRequired, secondMajorElective,
    } = this.state;

    const getSubtitle = () => {
      switch (itemFocus.from) {
        case ItemFocusFrom.TABLE_TAKEN:
          return `수강 완료 - ${itemFocus.item.lecture.year} ${getSemesterName(itemFocus.item.lecture.semester)}`;
        case ItemFocusFrom.TABLE_FUTURE:
          return `수강 예정 - ${itemFocus.item.year} ${getSemesterName(itemFocus.item.semester)}`;
        case ItemFocusFrom.TABLE_ARBITRARY:
          return `수강 예정 - ${itemFocus.item.year} ${getSemesterName(itemFocus.item.semester)}`;
        default:
          return 'Unknown';
      }
    };

    const getSemesterOptions = () => {
      if (itemFocus.item.item_type !== 'TAKEN') {
        return [
          ['NORMAL', t('ui.semesterInfo.normal')],
          ['SEASONAL', t('ui.semesterInfo.seasonal')],
        ];
      }
      if (itemFocus.item.lecture.semester % 2 === 1) {
        return [
          ['NORMAL', t('ui.semesterInfo.normal')],
        ];
      }
      return [
        ['SEASONAL', t('ui.semesterInfo.seasonal')],
      ];
    };

    return (
      <div className={classNames('subsection', 'subsection--course-manage-right')}>
        <div className={classNames('detail-title-area')}>
          <div className={classNames('title')}>{t('ui.title.lectureInformation')}</div>
          <div className={classNames('subtitle')}>{getSubtitle()}</div>
          <div className={classNames('buttons')}>
            <button type="reset" className={classNames('text-button', 'text-button--right')} onClick={this.initialize}>{t('ui.button.reset')}</button>
          </div>
        </div>
        <Scroller>
          <SearchFilter
            updateCheckedValues={this.updateCheckedValuesForSemester}
            inputName="semester"
            titleName={t('ui.search.semester')}
            options={getSemesterOptions()}
            checkedValues={selectedSemester}
            isRadio={true}
          />
          <SearchFilter
            updateCheckedValues={this.updateCheckedValuesForRetake}
            inputName="retake"
            titleName={t('ui.search.retake')}
            options={[
              ['NORMAL', t('ui.retake.normal')],
              ['RETAKE', t('ui.retake.retake')],
            ]}
            checkedValues={selectedRetake}
            isRadio={true}
          />
          {/* TODO: Implement credit customization */}
          {/* <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={true} />
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
          /> */}
        </Scroller>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  itemFocus: state.planner.itemFocus,
  selectedListCode: state.planner.list.selectedListCode,
});

const mapDispatchToProps = (dispatch) => ({
  updateItemInPlannerDispatch: (item) => {
    dispatch(updateItemInPlanner(item));
  },
  setItemFocusDispatch: (item, course, from, clicked) => {
    dispatch(setItemFocus(item, course, from, clicked));
  },
});


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    CourseCustomizeSubSection
  )
);

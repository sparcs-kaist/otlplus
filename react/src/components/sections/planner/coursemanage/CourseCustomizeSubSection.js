import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import axios from 'axios';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import Scroller from '../../../Scroller';
// import Divider from '../../../Divider';
import SearchFilter from '../../../SearchFilter';
// import CourseStatus from '../../../CourseStatus';
// import CountController from '../../../CountController';

import { getSemesterName } from '../../../../utils/semesterUtils';
import { getCourseOfItem, getSemesterOfItem } from '../../../../utils/itemUtils';

import { ItemFocusFrom } from '../../../../reducers/planner/itemFocus';
import { updateItemInPlanner } from '../../../../actions/planner/planner';
import { setItemFocus } from '../../../../actions/planner/itemFocus';

import userShape from '../../../../shapes/model/session/UserShape';
import itemFocusShape from '../../../../shapes/state/planner/ItemFocusShape';
import plannerShape from '../../../../shapes/model/planner/PlannerShape';


class CourseCustomizeSubSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedSemester: new Set([getSemesterOfItem(props.itemFocus.item) % 2 === 1 ? 'NORMAL' : 'SEASONAL']),
      selectedRetake: new Set([props.itemFocus.item.is_excluded ? 'RETAKE' : 'NORMAL']),
    };
  }

  updateCheckedValuesForSemester = (checkedValues) => {
    const {
      user, selectedPlanner, itemFocus,
      updateItemInPlannerDispatch, setItemFocusDispatch,
    } = this.props;

    this.setState({
      selectedSemester: checkedValues,
    });

    const selectedSemester = Array.from(checkedValues)[0];
    const newSemester = (
      selectedSemester === 'NORMAL'
        ? Math.ceil(itemFocus.item.semester / 2) * 2 - 1
        : Math.ceil(itemFocus.item.semester / 2) * 2
    );

    if (!user) {
      const newItem = {
        ...itemFocus.item,
        semester: newSemester,
      };
      updateItemInPlannerDispatch(newItem);
      setItemFocusDispatch(newItem, getCourseOfItem(newItem), itemFocus.from, itemFocus.clicked);
    }
    else {
      axios.post(
        `/api/users/${user.id}/planners/${selectedPlanner.id}/update-item`,
        {
          item: itemFocus.item.id,
          item_type: itemFocus.item.item_type,
          semester: newSemester,
        },
        {
          metadata: {
            gaCategory: 'Planner',
            gaVariable: 'POST Update / Instance',
          },
        },
      )
        .then((response) => {
          const newProps = this.props;
          if (!newProps.selectedPlanner || newProps.selectedPlanner.id !== selectedPlanner.id) {
            return;
          }
          updateItemInPlannerDispatch(response.data);
          setItemFocusDispatch(
            response.data, getCourseOfItem(response.data), itemFocus.from, itemFocus.clicked
          );
        })
        .catch((error) => {
        });
    }
  }

  updateCheckedValuesForRetake = (checkedValues) => {
    const {
      user, selectedPlanner, itemFocus,
      updateItemInPlannerDispatch, setItemFocusDispatch,
    } = this.props;

    this.setState({
      selectedRetake: checkedValues,
    });

    const selectedRetake = Array.from(checkedValues)[0];
    const newIsRetake = selectedRetake !== 'NORMAL';

    if (!user) {
      const newItem = {
        ...itemFocus.item,
        is_excluded: newIsRetake,
      };
      updateItemInPlannerDispatch(newItem);
      setItemFocusDispatch(
        newItem, getCourseOfItem(newItem), itemFocus.from, itemFocus.clicked
      );
    }
    else {
      axios.post(
        `/api/users/${user.id}/planners/${selectedPlanner.id}/update-item`,
        {
          item: itemFocus.item.id,
          item_type: itemFocus.item.item_type,
          is_excluded: newIsRetake,
        },
        {
          metadata: {
            gaCategory: 'Planner',
            gaVariable: 'POST Update / Instance',
          },
        },
      )
        .then((response) => {
          const newProps = this.props;
          if (!newProps.selectedPlanner || newProps.selectedPlanner.id !== selectedPlanner.id) {
            return;
          }
          updateItemInPlannerDispatch(response.data);
          setItemFocusDispatch(
            response.data, getCourseOfItem(response.data), itemFocus.from, itemFocus.clicked
          );
        })
        .catch((error) => {
        });
    }
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
      // totalCredit,
      // basicRequired, basicElective,
      // generalRequired, generalElective,
      // majorRequired, majorElective,
      // secondMajorRequired, secondMajorElective,
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
              {
                name: '전체',
                info: [
                  {
                    name: '총학점',
                    controller: (
                      <CountController
                        count={totalCredit}
                        updateCount={this.updateCredits('totalCredit')}
                      />
                  }
                ]
              },
              {
                name: '기초',
                info: [
                  {
                    name: '기초필수',
                    controller: (
                      <CountController
                        count={basicRequired}
                        updateCount={this.updateCredits('basicRequired')}
                      />
                  },
                  {
                    name: '기초선택',
                    controller: (
                      <CountController
                        count={basicElective}
                        updateCount={this.updateCredits('basicElective')}
                      />
                  },
                ],
              },
              {
                name: '교양',
                info: [
                  {
                    name: '교양필수',
                    controller: (
                      <CountController
                        count={generalRequired}
                        updateCount={this.updateCredits('generalRequired')}
                      />
                  },
                  {
                    name: '교양선택',
                    controller: (
                      <CountController
                        count={generalElective}
                        updateCount={this.updateCredits('generalElective')}
                      />
                  },
                ],
              },
              {
                name: '전공',
                info: [
                  {
                    name: '전공필수',
                    controller: (
                      <CountController
                        count={majorRequired}
                        updateCount={this.updateCredits('majorRequired')}
                      />
                  },
                  {
                    name: '전공선택',
                    controller: (
                      <CountController
                        count={majorElective}
                        updateCount={this.updateCredits('majorElective')}
                      />
                  },
                ],
              },
              {
                name: '복수전공',
                info: [
                  {
                    name: '전공필수',
                    controller: (
                      <CountController
                        count={secondMajorRequired}
                      updateCount={this.updateCredits('secondMajorRequired')}
                    />
                  },
                  {
                    name: '전공선택',
                    controller: (
                      <CountController
                        count={secondMajorElective}
                      updateCount={this.updateCredits('secondMajorElective')}
                    />
                  },
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
  selectedPlanner: state.planner.planner.selectedPlanner,
});

const mapDispatchToProps = (dispatch) => ({
  updateItemInPlannerDispatch: (item) => {
    dispatch(updateItemInPlanner(item));
  },
  setItemFocusDispatch: (item, course, from, clicked) => {
    dispatch(setItemFocus(item, course, from, clicked));
  },
});

CourseCustomizeSubSection.propTypes = {
  user: userShape,
  itemFocus: itemFocusShape,
  selectedPlanner: plannerShape,

  updateItemInPlannerDispatch: PropTypes.func.isRequired,
  setItemFocusDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    CourseCustomizeSubSection
  )
);

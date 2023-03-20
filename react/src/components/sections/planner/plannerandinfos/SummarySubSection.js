import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { range } from 'lodash';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import itemFocusShape from '../../../../shapes/state/ItemFocusShape';

import CreditStatusBar from '../../../CreditBar';
import CourseStatus from '../../../CourseStatus';
import Scroller from '../../../Scroller';
import { ItemFocusFrom } from '../../../../reducers/planner/itemFocus';
import {
  getCategory, getCategoryOfType, getColorOfCategory,
  getCredit, getCreditAndAu,
} from '../../../../utils/itemUtils';
import plannerShape from '../../../../shapes/model/PlannerShape';


const ValueIndex = {
  TAKEN: 0,
  PLANNED: 1,
  FOCUSED: 2,
  REQUIREMENT: 3,
};


class SummarySubSection extends Component {
  render() {
    const { t, itemFocus, selectedPlanner } = this.props;

    // TODO: Retrieve data from planner
    const majors = ['전산학부'];

    const totalCredit = [0, 0, 0, 136];
    // TODO: Apply constants to indexes
    // TODO: Load requirements from planner
    const categoryCreditAndAus = {
      // Basic
      0: [[[0, 0, 0, 23], [0, 0, 0, 9]]],
      // Major
      1: majors.map((m) => [[0, 0, 0, 19], [0, 0, 0, 30]]),
      // Research
      2: [[[0, 0, 0, 3], [0, 0, 0, 0]]],
      // General and humanity
      3: [[[0, 0, 0, 15], [0, 0, 0, 21]]],
      // Others
      4: [[[0, 0, 0, 0], [0, 0, 0, 0]]],
    };

    const categoryBigTitles = {
      // Basic
      0: [t('ui.type.basic')],
      // Major
      1: majors.map((m) => `${t('ui.type.major')} - ${m}`),
      // Research
      2: [`${t('ui.type.research')} - ${majors[0]}`],
      // General and humanity
      3: [t('ui.type.general')],
      // Others
      4: [t('ui.type.etc')],
    };
    const categoryTitles = {
      // Basic
      0: [[t('ui.type.basicRequired'), t('ui.type.basicElective')]],
      // Major
      1: majors.map((m) => [t('ui.type.majorRequired'), t('ui.type.majorElective')]),
      // Research
      2: [[t('ui.type.thesisStudy'), t('ui.type.individualStudy')]],
      // General and humanity
      3: [[t('ui.type.generalRequired'), t('ui.type.humanities')]],
      // Others
      4: [[t('ui.type.otherElective'), t('ui.type.unclassified')]],
    };

    if (selectedPlanner) {
      /* eslint-disable fp/no-mutation */
      selectedPlanner.taken_items.forEach((i) => {
        const category = getCategory(selectedPlanner, i);
        totalCredit[ValueIndex.TAKEN] += getCredit(i);
        categoryCreditAndAus[category[0]][category[1]][category[2]][ValueIndex.TAKEN] += getCreditAndAu(i);
      });
      selectedPlanner.future_items.forEach((i) => {
        const category = getCategory(selectedPlanner, i);
        totalCredit[ValueIndex.PLANNED] += getCredit(i);
        categoryCreditAndAus[category[0]][category[1]][category[2]][ValueIndex.PLANNED] += getCreditAndAu(i);
      });
      selectedPlanner.generic_items.forEach((i) => {
        const category = getCategory(selectedPlanner, i);
        totalCredit[ValueIndex.PLANNED] += getCredit(i);
        categoryCreditAndAus[category[0]][category[1]][category[2]][ValueIndex.PLANNED] += getCreditAndAu(i);
      });
      /* eslint-enable fp/no-mutation */
    }

    if (itemFocus.from === ItemFocusFrom.LIST) {
      /* eslint-disable fp/no-mutation */
      const category = getCategoryOfType(itemFocus.course.type_en);
      totalCredit[ValueIndex.FOCUSED] += itemFocus.course.credit;
      categoryCreditAndAus[category[0]][category[1]][category[2]][ValueIndex.FOCUSED] += itemFocus.course.credit + itemFocus.course.credit_au;
      /* eslint-enable fp/no-mutation */
    }
    else if (
      itemFocus.from === ItemFocusFrom.TABLE_TAKEN
      || itemFocus.from === ItemFocusFrom.TABLE_FUTURE
      || itemFocus.from === ItemFocusFrom.TABLE_GENERIC
    ) {
      /* eslint-disable fp/no-mutation */
      const category = getCategory(selectedPlanner, itemFocus.item);
      totalCredit[ValueIndex.FOCUSED] += getCredit(itemFocus.item);
      categoryCreditAndAus[category[0]][category[1]][category[2]][ValueIndex.FOCUSED] += getCreditAndAu(itemFocus.item);
      /* eslint-enable fp/no-mutation */
    }

    return (
      <>
        <div className={classNames('subsection', 'subsection--planner-summary')}>
          <Scroller>
            <CourseStatus
              entries={[
                {
                  name: t('ui.type.total'),
                  info: [
                    {
                      name: t('ui.type.totalCredit'),
                      controller: (
                        <CreditStatusBar
                          takenCredit={totalCredit[ValueIndex.TAKEN]}
                          plannedCredit={totalCredit[ValueIndex.TAKEN]}
                          focusedCredit={totalCredit[ValueIndex.FOCUSED]}
                          totalCredit={totalCredit[ValueIndex.REQUIREMENT]}
                          colorIndex={17}
                          focusFrom={itemFocus.from}
                        />
                      ),
                    },
                  ],
                },
                ...range(0, 5).map((i) => (
                  range(0, categoryCreditAndAus[i].length).map((j) => ({
                    name: categoryBigTitles[i][j],
                    info: range(0, categoryCreditAndAus[i][j].length).map((k) => (
                      {
                        name: categoryTitles[i][j][k],
                        controller: (
                          <CreditStatusBar
                            takenCredit={categoryCreditAndAus[i][j][k][ValueIndex.TAKEN]}
                            plannedCredit={categoryCreditAndAus[i][j][k][ValueIndex.PLANNED]}
                            focusedCredit={categoryCreditAndAus[i][j][k][ValueIndex.FOCUSED]}
                            totalCredit={categoryCreditAndAus[i][j][k][ValueIndex.REQUIREMENT]}
                            colorIndex={getColorOfCategory([i, j, k])}
                            focusFrom={itemFocus.from}
                          />
                        ),
                      }
                    )),
                  }))
                )).flat(),
              ]}
            />
          </Scroller>


        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  selectedPlanner: state.planner.planner.selectedPlanner,
  itemFocus: state.planner.itemFocus,
});

const mapDispatchToProps = (dispatch) => ({
});

SummarySubSection.propTypes = {
  selectedPlanner: plannerShape,
  itemFocus: itemFocusShape.isRequired,
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    SummarySubSection
  )
);

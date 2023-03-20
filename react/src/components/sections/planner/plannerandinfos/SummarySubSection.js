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
  getCategory, getColorOfCategory,
  getCredit, getCreditAndAu,
} from '../../../../utils/itemUtils';
import plannerShape from '../../../../shapes/model/PlannerShape';


const ValueIndex = {
  TAKEN: 0,
  PLANNED: 1,
  REQUIREMENT: 2,
};


class SummarySubSection extends Component {
  render() {
    const { t, itemFocus, selectedPlanner } = this.props;

    // TODO: Retrieve data from planner
    const majors = ['전산학부'];

    const totalCredit = [0, 0, 136];
    // TODO: Apply constants to indexes
    // TODO: Load requirements from planner
    const categoryCreditAndAus = {
      // Basic
      0: [[[0, 0, 23], [0, 0, 9]]],
      // Major
      1: majors.map((m) => [[0, 0, 19], [0, 0, 30]]),
      // Research
      2: [[[0, 0, 3], [0, 0, 0]]],
      // General and humanity
      3: [[[0, 0, 15], [0, 0, 21]]],
      // Others
      4: [[[0, 0, 0], [0, 0, 0]]],
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

    if (itemFocus.from !== ItemFocusFrom.NONE) {
      // TODO: Implement this
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
                          totalCredit={totalCredit[ValueIndex.REQUIREMENT]}
                          focusedCredit={0}
                          colorIndex={17}
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
                            totalCredit={categoryCreditAndAus[i][j][k][ValueIndex.REQUIREMENT]}
                            focusedCredit={0}
                            colorIndex={getColorOfCategory([i, j, k])}
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

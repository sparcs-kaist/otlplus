import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { range } from 'lodash';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import itemFocusShape from '../../../../shapes/state/ItemFocusShape';

import CreditStatusBar from '../../../CreditStatusBar';
import CourseStatus from '../../../CourseStatus';
import Scroller from '../../../Scroller';
import { ItemFocusFrom } from '../../../../reducers/planner/itemFocus';
import { getCategory, getCredit, getCreditAndAu } from '../../../../utils/itemUtils';
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
      0: [
        [
          [0, 0, 23],
          [0, 0, 0],
        ],
      ],
      // Major
      1: majors.map((m) => [
        [0, 0, 19],
        [0, 0, 30],
      ]),
      // Research
      2: [
        [
          [0, 0, 3],
          [0, 0, 0],
        ],
      ],
      // General and humanity
      3: [
        [
          [0, 0, 15],
          [0, 0, 21],
        ],
      ],
      // Others
      4: [
        [
          [0, 0, 0],
          [0, 0, 0],
        ],
      ],
    };

    const categoryBigTitles = {
      // Basic
      0: ['기초'],
      // Major
      1: majors.map((m) => `전공 - ${m}`),
      // Research
      2: [`연구 - ${majors[0]}`],
      // General and humanity
      3: ['교양'],
      // Others
      4: ['기타'],
    };
    const categoryTitles = {
      // Basic
      0: [
        [
          t('ui.type.basicRequired'),
          t('ui.type.basicElective'),
        ],
      ],
      // Major
      1: majors.map((m) => [
        t('ui.type.majorRequired'),
        t('ui.type.majorElective'),
      ]),
      // Research
      2: [
        [
          t('ui.type.graduationResearch'),
          t('ui.type.individualResearch'),
        ],
      ],
      // General and humanity
      3: [
        [
          t('ui.type.generalRequired'),
          t('ui.type.humanitiesSocialElective'),
        ],
      ],
      // Others
      4: [
        [
          t('ui.type.otherElective'),
          t('ui.type.others'),
        ],
      ],
    };

    if (selectedPlanner) {
      selectedPlanner.taken_items.forEach((i) => {
        const category = getCategory(selectedPlanner, i);
        // eslint-disable-next-line fp/no-mutation
        totalCredit[ValueIndex.TAKEN] += getCredit(i);
        // eslint-disable-next-line fp/no-mutation
        categoryCreditAndAus[category[0]][category[1]][category[2]][ValueIndex.TAKEN] += getCreditAndAu(i);
      });
      selectedPlanner.future_items.forEach((i) => {
        const category = getCategory(selectedPlanner, i);
        // eslint-disable-next-line fp/no-mutation
        totalCredit[ValueIndex.PLANNED] += getCredit(i);
        // eslint-disable-next-line fp/no-mutation
        categoryCreditAndAus[category[0]][category[1]][category[2]][ValueIndex.PLANNED] += getCreditAndAu(i);
      });
      selectedPlanner.generic_items.forEach((i) => {
        const category = getCategory(selectedPlanner, i);
        // eslint-disable-next-line fp/no-mutation
        totalCredit[ValueIndex.PLANNED] += getCredit(i);
        // eslint-disable-next-line fp/no-mutation
        categoryCreditAndAus[category[0]][category[1]][category[2]][ValueIndex.PLANNED] += getCreditAndAu(i);
      });
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
                  name: t('ui.attribute.all'),
                  info: [
                    {
                      name: '총학점',
                      controller: (
                        <CreditStatusBar
                          credit={totalCredit[ValueIndex.TAKEN]}
                          totalCredit={totalCredit[ValueIndex.REQUIREMENT]}
                          focusedCredit={0}
                          statusColor="#cccccc"
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
                            credit={categoryCreditAndAus[i][j][k][ValueIndex.TAKEN]}
                            totalCredit={categoryCreditAndAus[i][j][k][ValueIndex.REQUIREMENT]}
                            focusedCredit={0}
                            statusColor="#cccccc"
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

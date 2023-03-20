import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

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
    const majors = ['CS'];

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

    if (selectedPlanner) {
      selectedPlanner.taken_items.forEach((i) => {
        console.log(i);
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
                {
                  name: t('ui.attribute.basic'),
                  info: [
                    {
                      name: t('ui.type.basicRequired'),
                      controller: (
                        <CreditStatusBar
                          credit={categoryCreditAndAus[0][0][0][ValueIndex.TAKEN]}
                          totalCredit={categoryCreditAndAus[0][0][0][ValueIndex.REQUIREMENT]}
                          focusedCredit={0}
                          statusColor="#f3b6b5"
                        />
                      ),
                    },
                    {
                      name: t('ui.type.basicElective'),
                      controller: (
                        <CreditStatusBar
                          credit={categoryCreditAndAus[0][0][1][ValueIndex.TAKEN]}
                          totalCredit={categoryCreditAndAus[0][0][1][ValueIndex.REQUIREMENT]}
                          focusedCredit={0}
                          statusColor="#f3c8ae"
                        />
                      ),
                    },
                  ],
                },
                ...majors.map((m, index) => (
                  {
                    name: `${t('ui.attribute.major')} - ${m[t('js.property.name')]}`,
                    info: [
                      {
                        name: t('ui.type.majorRequired'),
                        controller: (
                          <CreditStatusBar
                            credit={categoryCreditAndAus[1][index][0][ValueIndex.TAKEN]}
                            totalCredit={categoryCreditAndAus[1][index][0][ValueIndex.REQUIREMENT]}
                            focusedCredit={0}
                            statusColor="#eee9a0"
                          />
                        ),
                      },
                      {
                        name: t('ui.type.majorElective'),
                        controller: (
                          <CreditStatusBar
                            credit={categoryCreditAndAus[1][index][0][ValueIndex.TAKEN]}
                            totalCredit={categoryCreditAndAus[1][index][0][ValueIndex.REQUIREMENT]}
                            focusedCredit={0}
                            statusColor="#e5f2a0"
                          />
                        ),
                      },
                    ],
                  }
                )),
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

import PropTypes from 'prop-types';

import takenPlannerItemShape from './TakenPlannerItemShape';
import futurePlannerItemShape from './FuturePlannerItemShape';
import arbitraryPlannerItemShape from './ArbitraryPlannerItemShape';


const plannerShape = PropTypes.exact({
  id: PropTypes.number.isRequired,
  start_year: PropTypes.number.isRequired,
  end_year: PropTypes.number.isRequired,
  taken_items: PropTypes.arrayOf(takenPlannerItemShape).isRequired,
  future_items: PropTypes.arrayOf(futurePlannerItemShape).isRequired,
  arbitrary_items: PropTypes.arrayOf(arbitraryPlannerItemShape).isRequired,
  arrange_order: PropTypes.number.isRequired,
});

export default plannerShape;

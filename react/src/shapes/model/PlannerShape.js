import PropTypes from 'prop-types';

import takenPlannerItemShape from './TakenPlannerItemShape';
import futurePlannerItemShape from './FuturePlannerItemShape';
import genericPlannerItemShape from './GenericPlannerItemShape';


const plannerShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  start_year: PropTypes.number.isRequired,
  end_year: PropTypes.number.isRequired,
  taken_items: PropTypes.arrayOf(takenPlannerItemShape).isRequired,
  future_items: PropTypes.arrayOf(futurePlannerItemShape).isRequired,
  generic_items: PropTypes.arrayOf(genericPlannerItemShape).isRequired,
  arrange_order: PropTypes.number.isRequired,
});

export default plannerShape;

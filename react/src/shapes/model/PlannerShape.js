import PropTypes from 'prop-types';

import takenPlannerItemShape from './TakenPlannerItemShape';
import futurePlannerItemShape from './FuturePlannerItemShape';
import arbitraryPlannerItemShape from './ArbitraryPlannerItemShape';
import generalTrackShape from './GeneralTrackShape';
import majorTrackShape from './MajorTrackShape';
import additionalTrackShape from './AdditionalTrackShape';


const plannerShape = PropTypes.exact({
  id: PropTypes.number.isRequired,
  start_year: PropTypes.number.isRequired,
  end_year: PropTypes.number.isRequired,
  general_track: generalTrackShape.isRequired,
  major_track: majorTrackShape.isRequired,
  additional_tracks: PropTypes.arrayOf(additionalTrackShape).isRequired,
  taken_items: PropTypes.arrayOf(takenPlannerItemShape).isRequired,
  future_items: PropTypes.arrayOf(futurePlannerItemShape).isRequired,
  arbitrary_items: PropTypes.arrayOf(arbitraryPlannerItemShape).isRequired,
  arrange_order: PropTypes.number.isRequired,
});

export default plannerShape;

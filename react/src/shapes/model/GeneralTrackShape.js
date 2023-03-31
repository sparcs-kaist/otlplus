import PropTypes from 'prop-types';


const generalTrackShape = PropTypes.exact({
  id: PropTypes.number.isRequired,
  start_year: PropTypes.number.isRequired,
  end_year: PropTypes.number.isRequired,
  is_foreign: PropTypes.bool.isRequired,
  total_credit: PropTypes.number.isRequired,
  total_au: PropTypes.number.isRequired,
  basic_required: PropTypes.number.isRequired,
  basic_elective: PropTypes.number.isRequired,
  thesis_study: PropTypes.number.isRequired,
  thesis_study_doublemajor: PropTypes.number.isRequired,
  general_required_credit: PropTypes.number.isRequired,
  general_required_au: PropTypes.number.isRequired,
  humanities: PropTypes.number.isRequired,
  humanities_doublemajor: PropTypes.number.isRequired,
});

export default generalTrackShape;

import PropTypes from 'prop-types';

export const SCHEDULE_FIELDS = [
  'courseDesciptionSubmission',
  'courseRegistrationPeriodStart',
  'courseRegistrationPeriodEnd',
  'courseAddDropPeriodEnd',
  'courseDropDeadline',
  'courseEvaluationDeadline',
  'gradePosting',
];

const semesterShape = PropTypes.shape({
  year: PropTypes.number.isRequired,
  semester: PropTypes.number.isRequired,
  beginning: PropTypes.string.isRequired,
  end: PropTypes.string.isRequired,
  ...Object.assign(
    {},
    ...SCHEDULE_FIELDS.map((f) => ({
      [f]: PropTypes.string,
    })),
  ),
});

export default semesterShape;

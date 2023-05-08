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

const semesterShape = PropTypes.exact({
  year: PropTypes.number.isRequired,
  semester: PropTypes.oneOf([1, 2, 3, 4]).isRequired,
  beginning: PropTypes.string.isRequired,
  end: PropTypes.string.isRequired,
  ...Object.assign({}, ...SCHEDULE_FIELDS.map((f) => ({
    [f]: PropTypes.string,
  }))),
});

export default semesterShape;

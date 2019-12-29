import PropTypes from 'prop-types';

export const SCHEDULE_FIELDS = [
  'beginning',
  'end',
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
  // eslint-disable-next-line fp/no-mutating-assign
  ...Object.assign(...SCHEDULE_FIELDS.map(f => ({
    f: PropTypes.string.isRequired,
  }))),
});

console.log(semesterShape);

export default semesterShape;

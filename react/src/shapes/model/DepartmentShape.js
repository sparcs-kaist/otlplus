import PropTypes from 'prop-types';

const departmentShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  name_en: PropTypes.string.isRequired,
  code: PropTypes.string.isRequired,
});

export default departmentShape;

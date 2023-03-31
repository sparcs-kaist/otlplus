import PropTypes from 'prop-types';


const departmentShape = PropTypes.exact({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  name_en: PropTypes.string.isRequired,
  code: PropTypes.string.isRequired,
});

export default departmentShape;

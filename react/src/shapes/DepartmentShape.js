import PropTypes from 'prop-types';


const DepartmentShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  name_en: PropTypes.string.isRequired,
  code: PropTypes.string.isRequired,
});

export default DepartmentShape;

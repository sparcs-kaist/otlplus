import PropTypes from 'prop-types';


const NestedProfessorShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  name_en: PropTypes.string.isRequired,
  professor_id: PropTypes.number.isRequired,
});

export default NestedProfessorShape;

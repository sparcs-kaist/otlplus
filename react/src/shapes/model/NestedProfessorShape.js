import PropTypes from 'prop-types';


const nestedProfessorShape = PropTypes.exact({
  name: PropTypes.string.isRequired,
  name_en: PropTypes.string.isRequired,
  professor_id: PropTypes.number.isRequired,
});

export default nestedProfessorShape;

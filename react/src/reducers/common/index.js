import { combineReducers } from 'redux';
import user from './user';
import semester from './semester';
import media from './media';

const CombinedReducer = combineReducers({
  user: user,
  semester: semester,
  media: media,
});

export default CombinedReducer;

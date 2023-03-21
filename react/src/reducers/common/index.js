import { combineReducers } from 'redux';
import user from './user';
import semester from './semester';
import track from './track';
import media from './media';

const CombinedReducer = combineReducers({
  user: user,
  semester: semester,
  track: track,
  media: media,
});

export default CombinedReducer;

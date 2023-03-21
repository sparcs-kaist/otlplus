const BASE_STRING = 'C_T_';

/* eslint-disable prefer-template */
export const SET_TRACKS = BASE_STRING + 'SET_TRACKS';
/* eslint-enable prefer-template */

export function setTracks(tracks) {
  return {
    type: SET_TRACKS,
    tracks: tracks,
  };
}

const BASE_STRING = 'C_M_';

/* eslint-disable prefer-template */
export const SET_IS_PORTRAIT = BASE_STRING + 'SET_IS_PORTRAIT';
/* eslint-enable prefer-template */


export function setIsPortrait(isPortrait) {
  return {
    type: SET_IS_PORTRAIT,
    isPortrait: isPortrait,
  };
}

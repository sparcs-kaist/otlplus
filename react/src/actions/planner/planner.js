const BASE_STRING = 'P_P_';

/* eslint-disable prefer-template */
export const RESET = BASE_STRING + 'RESET';
export const SET_PLANNERS = BASE_STRING + 'SET_PLANNERS';
export const CLEAR_PLANNERS = BASE_STRING + 'CLEAR_PLANNERS';
export const SET_SELECTED_PLANNER = BASE_STRING + 'SET_SELECTED_PLANNER';
export const CREATE_PLANNER = BASE_STRING + 'CREATE_PLANNER';
export const DELETE_PLANNER = BASE_STRING + 'DELETE_PLANNER';
export const DUPLICATE_PLANNER = BASE_STRING + 'DUPLICATE_PLANNER';
export const UPDATE_PLANNER = BASE_STRING + 'UPDATE_PLANNER';
export const ADD_ITEM_TO_PLANNER = BASE_STRING + 'ADD_ITEM_TO_PLANNER';
export const UPDATE_ITEM_IN_PLANNER = BASE_STRING + 'UPDATE_ITEM_IN_PLANNER';
export const REMOVE_ITEM_FROM_PLANNER = BASE_STRING + 'REMOVE_ITEM_FROM_PLANNER';
export const REORDER_PLANNER = BASE_STRING + 'REORDER_PLANNER';
export const UPDATE_CELL_SIZE = BASE_STRING + 'UPDATE_CELL_SIZE';
export const SET_IS_TRACK_SETTINGS_SECTION_OPEN = BASE_STRING + 'SET_IS_TRACK_SETTINGS_SECTION_OPEN';
/* eslint-enable prefer-template */

export function reset() {
  return {
    type: RESET,
  };
}

export function setPlanners(planners) {
  return {
    type: SET_PLANNERS,
    planners: planners,
  };
}

export function clearPlanners() {
  return {
    type: CLEAR_PLANNERS,
  };
}

export function setSelectedPlanner(planner) {
  return {
    type: SET_SELECTED_PLANNER,
    planner: planner,
  };
}

export function createPlanner(newPlanner) {
  return {
    type: CREATE_PLANNER,
    newPlanner: newPlanner,
  };
}

export function deletePlanner(planner) {
  return {
    type: DELETE_PLANNER,
    planner: planner,
  };
}

export function updatePlanner(updatedPlanner) {
  return {
    type: UPDATE_PLANNER,
    updatedPlanner: updatedPlanner,
  };
}

export function addItemToPlanner(item) {
  return {
    type: ADD_ITEM_TO_PLANNER,
    item: item,
  };
}

export function updateItemInPlanner(item) {
  return {
    type: UPDATE_ITEM_IN_PLANNER,
    item: item,
  };
}

export function removeItemFromPlanner(item) {
  return {
    type: REMOVE_ITEM_FROM_PLANNER,
    item: item,
  };
}

export function reorderPlanner(planner, arrangeOrder) {
  return {
    type: REORDER_PLANNER,
    planner: planner,
    arrangeOrder: arrangeOrder,
  };
}

export function updateCellSize(width, height) {
  return {
    type: UPDATE_CELL_SIZE,
    width: width,
    height: height,
  };
}

export function setIsTrackSettingsSectionOpen(isTrackSettingsSectionOpen) {
  return {
    type: SET_IS_TRACK_SETTINGS_SECTION_OPEN,
    isTrackSettingsSectionOpen: isTrackSettingsSectionOpen,
  };
}

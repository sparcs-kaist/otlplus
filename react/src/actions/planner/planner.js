const BASE_STRING = 'P_P_';

/* eslint-disable prefer-template */
export const RESET = BASE_STRING + 'RESET';
export const SET_PLANNERS = BASE_STRING + 'SET_PLANNERS';
export const CLEAR_PLANNERS = BASE_STRING + 'CLEAR_PLANNERS';
export const SET_MY_PLANNER_LECTURES = BASE_STRING + 'SET_MY_PLANNER_LECTURES';  // COURSE?
export const SET_SELECTED_PLANNER = BASE_STRING + 'SET_SELECTED_PLANNER';
export const CREATE_PLANNER = BASE_STRING + 'CREATE_PLANNER';
export const DELETE_PLANNER = BASE_STRING + 'DELETE_PLANNER';
export const DUPLICATE_PLANNER = BASE_STRING + 'DUPLICATE_PLANNER';
export const ADD_LECTURE_TO_PLANNER = BASE_STRING + 'ADD_LECTURE_TO_PLANNER';
export const REMOVE_LECTURE_FROM_PLANNER = BASE_STRING + 'REMOVE_LECTURE_FROM_PLANNER';
export const UPDATE_CELL_SIZE = BASE_STRING + 'UPDATE_CELL_SIZE';
export const SET_IS_DRAGGING = BASE_STRING + 'SET_IS_DRAGGING';
export const SET_MOBILE_IS_PLANNER_TABS_OPEN = BASE_STRING + 'SET_MOBILE_IS_PLANNER_TABS_OPEN';
/* eslint-enable prefer-template */

export function reset() {
    return {
      type: RESET,
    };
  }
  
  export function addLectureTopPlanner(lecture) {
    return {
      type: ADD_LECTURE_TO_PLANNER,
      lecture: lecture,
    };
  }
  
  export function removeLectureFromPlanner(lecture) {
    return {
      type: REMOVE_LECTURE_FROM_PLANNER,
      lecture: lecture,
    };
  }
  
  export function setPlanners(planenrs) {
    return {
      type: SET_PLANNERS,
      planenrs: planenrs,
    };
  }
  
  export function clearPlanners() {
    return {
      type: CLEAR_PLANNERS,
    };
  }
  
  export function setMyPlannerLectures(lectures) {
    return {
      type: SET_MY_PLANNER_LECTURES,
      lectures: lectures,
    };
  }
  
  export function setSelectedPlanner(planner) {
    return {
      type: SET_SELECTED_PLANNER,
      planner: planner,
    };
  }
  
  export function createPlanner(id) {
    return {
      type: CREATE_PLANNER,
      id: id,
    };
  }
  
  export function deletePlanner(planner) {
    return {
      type: DELETE_PLANNER,
      planner: planner,
    };
  }
  
  export function duplicatePlanner(id, planenr) {
    return {
      type: DUPLICATE_PLANNER,
      id: id,
      planenr: planenr,
    };
  }
  
  export function updateCellSize(width, height) {
    return {
      type: UPDATE_CELL_SIZE,
      width: width,
      height: height,
    };
  }
  
  export function setIsDragging(isDragging) {
    return {
      type: SET_IS_DRAGGING,
      isDragging: isDragging,
    };
  }
  
  export function setMobileIsPlannerTabsOpen(mobileIsPlannerTabsOpen) {
    return {
      type: SET_MOBILE_IS_PLANNER_TABS_OPEN,
      mobileIsPlannerTabsOpen: mobileIsPlannerTabsOpen,
    };
  }
  
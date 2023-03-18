import {
  RESET,
  SET_PLANNERS, CLEAR_PLANNERS,
  SET_SELECTED_PLANNER,
  CREATE_PLANNER, DELETE_PLANNER, DUPLICATE_PLANNER,
  // ADD_LECTURE_TO_PLANNER, REMOVE_LECTURE_FROM_PLANNER,
  REORDER_PLANNER,
  UPDATE_CELL_SIZE,
} from '../../actions/planner/planner';

const initialState = {
  planners: null,
  selectedPlanner: null,
  cellWidth: 200,
  cellHeight: 50,
  isDragging: false,
  mobileIsPlannerTabsOpen: false,
};

const planner = (state = initialState, action) => {
  switch (action.type) {
    case RESET: {
      return initialState;
    }
    case SET_PLANNERS: {
      return Object.assign({}, state, {
        planners: action.planners,
        selectedPlanner: action.planners.length > 0
          ? action.planners[0]
          : null,
      });
    }
    case CLEAR_PLANNERS: {
      return Object.assign({}, state, {
        planners: null,
        selectedPlanner: null,
      });
    }
    case SET_SELECTED_PLANNER: {
      return Object.assign({}, state, {
        selectedPlanner: action.planner,
      });
    }
    case CREATE_PLANNER: {
      const newArrangeOrder = state.planners.length > 0
        ? Math.max(...state.planners.map((t) => t.arrange_order)) + 1
        : 0;
      const newPlanner = {
        id: action.id,
        lectures: [],
        arrange_order: newArrangeOrder,
      };
      return Object.assign({}, state, {
        selectedPlanner: newPlanner,
        planners: [
          ...state.planners,
          newPlanner,
        ],
      });
    }
    case DELETE_PLANNER: {
      const indexOfPlanner = state.planners.findIndex((t) => (t.id === action.planner.id));
      const newPlanners = state.planners.filter((t) => (t.id !== action.planner.id));
      const newSelectedPlanner = (indexOfPlanner !== state.planners.length - 1)
        ? newPlanners[indexOfPlanner]
        : newPlanners[indexOfPlanner - 1];
      return Object.assign({}, state, {
        selectedPlanner: newSelectedPlanner,
        planners: newPlanners,
      });
    }
    case DUPLICATE_PLANNER: {
      const newPlanner = {
        id: action.id,
        lectures: action.planner.lectures.slice(),
        arrange_order: Math.max(...state.planners.map((t) => t.arrange_order)) + 1,
      };
      return Object.assign({}, state, {
        selectedPlanner: newPlanner,
        planners: [
          ...state.planners,
          newPlanner,
        ],
      });
    }
    /*
    case ADD_LECTURE_TO_PLANNER: {
      const newPlanner = {
        id: state.selectedPlanner.id,
        lectures: state.selectedPlanner.lectures.concat([action.lecture]),
      };
      const newPlanners = state.planners.map((t) => (
        t.id === newPlanner.id
          ? newPlanner
          : t
      ));
      return Object.assign({}, state, {
        selectedPlanner: newPlanner,
        planners: newPlanners,
      });
    }
    case REMOVE_LECTURE_FROM_PLANNER: {
      const newPlanner = {
        id: state.selectedPlanner.id,
        lectures: state.selectedPlanner.lectures.filter((l) => (l.id !== action.lecture.id)),
      };
      const newPlanners = state.planners.map((t) => (
        t.id === newPlanner.id
          ? newPlanner
          : t
      ));
      return Object.assign({}, state, {
        selectedPlanner: newPlanner,
        planners: newPlanners,
      });
    }
    */
    case REORDER_PLANNER: {
      const newPlanners = state.planners.map((t) => {
        if (t.id === action.planner.id) {
          return {
            ...t,
            arrange_order: action.arrangeOrder,
          };
        }
        if (action.arrangeOrder <= t.arrange_order && t.arrange_order < action.planner.arrange_order) {
          return {
            ...t,
            arrange_order: t.arrange_order + 1,
          };
        }
        if (action.planner.arrange_order < t.arrange_order && t.arrange_order <= action.arrangeOrder) {
          return {
            ...t,
            arrange_order: t.arrange_order - 1,
          };
        }
        return t;
      });
      // eslint-disable-next-line fp/no-mutating-methods
      newPlanners.sort((t1, t2) => (t1.arrange_order - t2.arrange_order));
      const updatedPlanner = newPlanners.find((t) => (t.id === state.selectedPlanner.id));
      return Object.assign({}, state, {
        planners: newPlanners,
        selectedPlanner: updatedPlanner,
      });
    }
    case UPDATE_CELL_SIZE: {
      return Object.assign({}, state, {
        cellWidth: action.width,
        cellHeight: action.height,
      });
    }
    default: {
      return state;
    }
  }
};

export default planner;

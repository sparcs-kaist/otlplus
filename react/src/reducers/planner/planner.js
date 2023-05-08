import {
  RESET,
  SET_PLANNERS, CLEAR_PLANNERS,
  SET_SELECTED_PLANNER,
  CREATE_PLANNER, DELETE_PLANNER,
  UPDATE_PLANNER,
  ADD_ITEM_TO_PLANNER, UPDATE_ITEM_IN_PLANNER, REMOVE_ITEM_FROM_PLANNER,
  REORDER_PLANNER,
  UPDATE_CELL_SIZE,
  SET_IS_TRACK_SETTINGS_SECTION_OPEN,
} from '../../actions/planner/planner';

const initialState = {
  planners: null,
  selectedPlanner: null,
  cellWidth: 200,
  cellHeight: 50,
  isDragging: false,
  isTrackSettingsSectionOpen: false,
  mobileIsPlannerTabsOpen: false,
};

const getListNameOfType = (type) => {
  switch (type) {
    case 'TAKEN':
      return 'taken_items';
    case 'FUTURE':
      return 'future_items';
    case 'ARBITRARY':
      return 'arbitrary_items';
    default:
      return undefined;
  }
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
      return Object.assign({}, state, {
        selectedPlanner: action.newPlanner,
        planners: [
          ...state.planners,
          action.newPlanner,
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
    case UPDATE_PLANNER: {
      return Object.assign({}, state, {
        selectedPlanner: (
          state.selectedPlanner.id === action.updatedPlanner.id
            ? action.updatedPlanner
            : state.selectedPlanner
        ),
        planners: state.planners.map((t) => (
          t.id === action.updatedPlanner.id
            ? action.updatedPlanner
            : t
        )),
      });
    }
    case ADD_ITEM_TO_PLANNER: {
      const listName = getListNameOfType(action.item.item_type);
      const newPlanner = {
        ...state.selectedPlanner,
        [listName]: state.selectedPlanner[listName].concat([action.item]),
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
    case UPDATE_ITEM_IN_PLANNER: {
      const listName = getListNameOfType(action.item.item_type);
      const newPlanner = {
        ...state.selectedPlanner,
        [listName]:
          state.selectedPlanner[listName].map((i) => (i.id === action.item.id ? action.item : i)),
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
    case REMOVE_ITEM_FROM_PLANNER: {
      const listName = getListNameOfType(action.item.item_type);
      const newPlanner = {
        ...state.selectedPlanner,
        [listName]: state.selectedPlanner[listName].filter((i) => (i.id !== action.item.id)),
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
    case REORDER_PLANNER: {
      const newPlanners = state.planners.map((t) => {
        if (t.id === action.planner.id) {
          return {
            ...t,
            arrange_order: action.arrangeOrder,
          };
        }
        if (action.arrangeOrder <= t.arrange_order
          && t.arrange_order < action.planner.arrange_order) {
          return {
            ...t,
            arrange_order: t.arrange_order + 1,
          };
        }
        if (action.planner.arrange_order < t.arrange_order
          && t.arrange_order <= action.arrangeOrder) {
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
    case SET_IS_TRACK_SETTINGS_SECTION_OPEN: {
      return Object.assign({}, state, {
        isTrackSettingsSectionOpen: action.isTrackSettingsSectionOpen,
      });
    }
    default: {
      return state;
    }
  }
};

export default planner;

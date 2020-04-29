import { SET_ALERT, REMOVE_ALERT } from "../actions/types";

const initialState = [];

export default function (state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    // To set a new alert send it in an array with previous state and add the payload of the alert
    case SET_ALERT:
      return [...state, payload];
    // To remove all alerts check if they are not equal to current payload.
    case REMOVE_ALERT:
      return state.filter((alert) => alert.id !== payload);
    default:
      return state;
  }
}

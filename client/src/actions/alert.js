import { SET_ALERT, REMOVE_ALERT } from "./types";
import { v4 as uuidv4 } from "uuid";

export const setAlert = (msg, alertType, timeout = 3000) => (dispatch) => {
  // Create a long string id using v4 of uuid
  const id = uuidv4();
  dispatch({
    type: SET_ALERT,
    payload: { msg, alertType, id },
  });

  // Set a timeout and trigger "remove alert"
  setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), timeout);
};

import { SET_ALERT, REMOVE_ALERT } from "./types";
import uuid from "uuid";

export const setAlert = (msg, alertType) => (dispatch) => {
  // Create a long string id using v4 of uuid
  const id = uuid.v4();
  dispatch({
    type: SET_ALERT,
    payload: { msg, alertType, id },
  });
};

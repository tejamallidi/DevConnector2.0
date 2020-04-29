import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

// Step 3: Once we got the array from the state store display the alert msg with appropriate style based on the alert message.
const Alert = ({ alerts }) =>
  alerts !== null &&
  alerts.length > 0 &&
  alerts.map((alert) => (
    <div key={alert.id} className={`alert alert-${alert.alertType}`}>
      {alert.msg}
    </div>
  ));

// Step 2: In the proptypes making sure to get the array
Alert.propTypes = {
  alerts: PropTypes.array.isRequired,
};

// Step 1: Mapping the redux state to a Prop in this component
const mapStateToProps = (state) => ({
  alerts: state.alert,
});

export default connect(mapStateToProps)(Alert);

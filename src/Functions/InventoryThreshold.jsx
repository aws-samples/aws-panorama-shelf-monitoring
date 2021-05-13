/* eslint-disable no-console */
import React, { useEffect, useReducer } from "react";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Typography from "@material-ui/core/Typography";
import Amplify, { API } from "aws-amplify";
import awsconfig from "../aws-exports";
import { getShelfMonitor } from "../graphql/queries";
import { getThresholds } from "../graphql/introspections";

Amplify.configure(awsconfig);

const initialState = {
  validThresholds: [],
  threshold: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "LISTTHRESHOLDS":
      return { ...state, validThresholds: action.thresholdList };
    case "SETTHRESHOLD":
      return { ...state, threshold: action.threshold };
    default:
      return state;
  }
}

function InventoryThreshold() {
  const [state, dispatch] = useReducer(reducer, initialState);

  async function getValidThresholds() {
    try {
      const validThresholds = await API.graphqlOperation(getThresholds);
      console.log("valid thresholds: ", validThresholds);
      dispatch({
        type: "LISTTHRESHOLDS",
        thresholdList: validThresholds["data"]["__type"]["enumValues"],
      });
    } catch (err) {
      console.log("error fetching data: ", err);
    }
  }

  async function getThreshold() {
    try {
      const threshold = await API.graphqlOperation(getShelfMonitor, {
        input: "BOTTLE",
      });
      if (threshold.data.getShelfMonitor == null) {
        dispatch({
          type: "SETTHRESHOLD",
          threshold: "Please set a threshold...",
        });
        return;
      }

      const thresholdResult = threshold.data.getShelfMonitor.Threshold;
      console.log("current threshold: ", thresholdResult);
      dispatch({
        type: "SETTHRESHOLD",
        threshold: thresholdResult,
      });
    } catch (err) {
      console.log("error fetching data: ", err);
    }
  }

  useEffect(() => {
    getValidThresholds();
    getThreshold();
  }, []);

  const handleChange = (event) => {
    dispatch({
      type: "SETTHRESHOLD",
      threshold: event.target.value,
    });
  };

  return (
    <div>
      <Grid item xs={3}>
        <Paper>
          <Typography variant="body1" style={{ textAlign: "center" }}>
            Specify how low the bottle count should be before you get notified
            of a low inventory.
          </Typography>
          <FormControl>
            <InputLabel>Alert Threshold</InputLabel>
            <Select
              id="select-threshold"
              value={state.threshold}
              onChange={handleChange}
            >
              {state.validThresholds.map((v) => (
                <MenuItem value={v}>v</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      </Grid>
    </div>
  );
}

export default InventoryThreshold;

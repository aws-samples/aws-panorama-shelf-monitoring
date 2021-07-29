/* eslint-disable no-console */
import React, { useEffect, useReducer } from "react";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { Box, InputLabel } from "@material-ui/core";
import Amplify, { API, graphqlOperation } from "aws-amplify";
import awsconfig from "./../aws-exports";
import { getShelfMonitor } from "../graphql/queries";
import { updateShelfMonitor, createShelfMonitor } from "../graphql/mutations";

Amplify.configure(awsconfig);

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 140,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const initialState = {
  validThresholds: [],
  threshold: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "SETTHRESHOLD":
      return { ...state, threshold: action.threshold };
    default:
      return state;
  }
}

function InventoryThreshold() {
  const classes = useStyles();
  const [state, dispatch] = useReducer(reducer, initialState);
  const productType = "BOTTLE";

  async function getThreshold() {
    try {
      const threshold = await API.graphql(
        graphqlOperation(getShelfMonitor, {
          ProductType: productType,
        }),
      );
      if (threshold.data.getShelfMonitor == null) {
        dispatch({
          type: "SETTHRESHOLD",
          threshold: "",
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

  async function putThreshold(threshold) {
    console.log(threshold);
    try {
      await API.graphql(
        graphqlOperation(updateShelfMonitor, {
          input: {
            ProductType: productType,
            Threshold: threshold,
          },
        }),
      );
    } catch (err) {
      if (
        err.errors[0].errorType === "DynamoDB:ConditionalCheckFailedException"
      ) {
        await API.graphql(
          graphqlOperation(createShelfMonitor, {
            input: {
              ProductType: productType,
              Threshold: threshold,
            },
          }),
        );
      } else {
        console.log(err);
      }
    }
  }

  useEffect(() => {
    getThreshold();
  }, []);

  const handleChange = (event) => {
    dispatch({
      type: "SETTHRESHOLD",
      threshold: event.target.value,
    });

    putThreshold(event.target.value);
  };

  return (
    <Grid item xs={5}>
      <Paper>
        <Typography variant="body1" style={{ textAlign: "center" }}>
          Specify how low the bottle count should be before you get notified of
          a low inventory.
        </Typography>
        <Box display="flex" justifyContent="center">
          <FormControl className={classes.formControl}>
            <InputLabel>
              <em>Alert Threshold</em>
            </InputLabel>
            <Select
              id="select-threshold"
              value={state.threshold}
              onChange={handleChange}
            >
              <MenuItem value="0">ZERO</MenuItem>
              <MenuItem value="1">ONE</MenuItem>
              <MenuItem value="2">TWO</MenuItem>
              <MenuItem value="3">THREE</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>
    </Grid>
  );
}

export default InventoryThreshold;

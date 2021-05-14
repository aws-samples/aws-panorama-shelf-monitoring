/* eslint-disable react/react-in-jsx-scope */
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import React, { useEffect, useReducer } from "react";

import Amplify, { API, graphqlOperation } from "aws-amplify";
import awsconfig from "../aws-exports";
import { onUpdateShelfMonitor } from "../graphql/subscriptions";

Amplify.configure(awsconfig);

const useStyles = makeStyles(() => ({
  image: {
    width: "100%",
    height: "100%",
    margin: "auto",
  },
}));

const initialState = {
  s3Uri: "./default.png",
  count: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "S3URI":
      return { ...state, s3Uri: action.s3Uri, count: action.count };
    default:
      return state;
  }
}

function Body() {
  const classes = useStyles();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onUpdateShelfMonitor),
    ).subscribe({
      next: (eventData) => {
        const data = eventData.value.data.onUpdateShelfMonitor;
        dispatch({ type: "S3URI", data });
      },
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <Grid item xs={5}>
      <Paper>
        <Typography variant="body1" style={{ textAlign: "center" }}>
          Near-real-time display of shelf
        </Typography>
        <img src={state.s3Uri} alt="Detections" className={classes.image} />

        <Typography variant="body1">
          Count of bottles:{" "}
          {state.count === "" ? <em>Waiting for bottles...</em> : state.count}
        </Typography>
      </Paper>
    </Grid>
  );
}

export default Body;

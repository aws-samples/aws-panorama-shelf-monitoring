/* eslint-disable react/react-in-jsx-scope */
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";

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

function Body() {
  const classes = useStyles();
  const [state, setstate] = useState(initialState);

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onUpdateShelfMonitor),
    ).subscribe({
      next: (eventData) => {
        const data = eventData.value.data.onUpdateShelfMonitor;
        console.log(data);
        if (data.s3Uri === null) {
          console.log("null");
        }
        setstate({ s3Uri: data.s3Uri, count: data.count });
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

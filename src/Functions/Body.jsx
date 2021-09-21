/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
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

function Body() {
  const classes = useStyles();

  const initialState = {
    s3Uri: "./default.png",
    count: "",
  };
  const [shelf, setShelf] = useState(initialState);

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
        setShelf({
          ...shelf,
          s3Uri: data.s3Uri,
          count: data.count,
        });
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
        <img src={shelf.s3Uri} alt="Detections" className={classes.image} />

        <Typography variant="body1">
          Count of bottles:{" "}
          {shelf.count === "" ? <em>Waiting for bottles...</em> : shelf.count}
        </Typography>
      </Paper>
    </Grid>
  );
}

export default Body;

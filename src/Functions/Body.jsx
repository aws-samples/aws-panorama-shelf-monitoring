/* eslint-disable react/react-in-jsx-scope */
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

function Body() {
  return (
    <Grid item xs={5}>
      <Paper>
        <Typography variant="body1" style={{ textAlign: "center" }}>
          Near-real-time display of shelf
        </Typography>
      </Paper>
    </Grid>
  );
}

export default Body;

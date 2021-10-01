/* eslint-disable react/react-in-jsx-scope */
import { Paper } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

function Header() {
  return (
    <Grid item xs={10}>
      <Paper style={{ margin: 10 }}>
        <Typography variant="h2" style={{ textAlign: "center" }}>
          AWS Panorama |{" "}
          <span style={{ color: "#FF9900" }}>Shelf Monitoring</span>
        </Typography>
      </Paper>
    </Grid>
  );
}

export default Header;

/* eslint-disable react/react-in-jsx-scope */
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

function Header() {
  return (
    <Grid item xs={10}>
      <Typography variant="h2" style={{ textAlign: "center" }}>
        AWS Panorama | Smart Shelf Blah
      </Typography>
    </Grid>
  );
}

export default Header;

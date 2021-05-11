/* eslint-disable no-undef */
/* eslint-disable react/react-in-jsx-scope */
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Typography from "@material-ui/core/Typography";

function InventoryThreshold() {
  const [age, setAge] = React.useState();

  const handleChange = (event) => {
    setAge(event.target.value);
  };

  return (
    <div>
      <Grid item xs={10}>
        <Paper>
          <Typography variant="body1" style={{ textAlign: "center" }}>
            Specify how low the bottle count should be before you get notified
            of a low inventory.
          </Typography>
          <FormControl>
            <InputLabel>Alert Threshold</InputLabel>
            <Select
              id="select-threshold"
              value={age}
              onChange={handleChange}
            ></Select>
          </FormControl>
        </Paper>
      </Grid>
    </div>
  );
}

export default InventoryThreshold;

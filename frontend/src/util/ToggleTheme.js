import React from 'react';
// import theme from '../util/theme';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { makeStyles } from '@material-ui/core/styles';

// Redux
import { connect, useDispatch } from 'react-redux';
import { SET_LIGHT_THEME, SET_DARK_THEME } from '../redux/types';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    alignItems: 'center',
  },
}));

const ToggleTheme = ({ theme }) => {
  const classes = useStyles();
  const [checked, setChecked] = React.useState(false);
  const dispatch = useDispatch();

  const [dark, setDark] = React.useState(localStorage.getItem('dark-mode') === 'true');

  React.useEffect(() => {
    localStorage.setItem('dark-mode', dark);
  }, [dark]);

  const toggleDarkMode = () => {
    setDark(!dark);
  };

  const toggleChecked = () => {
    setChecked(prev => !prev);
    toggleDarkMode();
    theme === 'light' || theme === 'false'
      ? dispatch({ type: SET_DARK_THEME })
      : dispatch({ type: SET_LIGHT_THEME });
  };

  const buttonLabel = theme === 'light' || theme === 'false' ? '🌛' : '🌞';

  return (
    <FormGroup className={classes.container}>
      <FormControlLabel
        control={<Switch color='secondary' checked={checked} onChange={toggleChecked} />}
        label={buttonLabel}
      />
    </FormGroup>
  );
};

const mapStateToProps = state => {
  return {
    theme: state.theme.theme,
  };
};
export default connect(mapStateToProps)(ToggleTheme);

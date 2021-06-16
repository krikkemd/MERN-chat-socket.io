import { useState } from 'react';

// Redux
import { connect, useDispatch } from 'react-redux';
import { login } from '../redux/actions/userActions';

// MUI
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import { CLEAR_ERRORS } from '../redux/types';

const Copyright = () => {
  return (
    <Typography variant='body2' color='textSecondary' align='center'>
      {'Copyright © '}
      <Link color='inherit' href='https://dnk.nl/'>
        DNK
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
};
//  MUI
const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

// Render
const SignIn = props => {
  // Props
  // console.log(props.user);

  const dispatch = useDispatch();

  // Local State
  const [fields, setFields] = useState({
    email: '',
    password: '',
  });

  // Mui
  const classes = useStyles();

  // Local functions
  const handleChange = e => {
    dispatch({ type: CLEAR_ERRORS });
    setFields({
      ...fields,
      [e.target.id]: e.target.value,
    });
  };

  const { email, password } = fields;

  const handleSubmit = e => {
    e.preventDefault();
    console.log(fields);
    props.login(email, password, props.history);
    setFields({ ...fields, password: '' });
  };

  return (
    <Container component='main' maxWidth='xs'>
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component='h1' variant='h5'>
          DNK
        </Typography>
        <form className={classes.form} noValidate onSubmit={handleSubmit}>
          <TextField
            variant='outlined'
            margin='normal'
            required
            fullWidth
            id='email'
            label='Email Adres'
            name='email'
            autoComplete='off'
            value={fields.email}
            onChange={handleChange}
            autoFocus
            error={props.errors && props.errors.length > 0 ? true : false}
            helperText={
              props.errors && props.errors.length > 0 ? props.errors[props.errors.length - 1] : ''
            }
          />
          <TextField
            variant='outlined'
            margin='normal'
            required
            fullWidth
            name='password'
            label='Wachtwoord'
            type='password'
            id='password'
            autoComplete='off'
            value={fields.password}
            onChange={handleChange}
            error={props.errors && props.errors.length > 0 ? true : false}
            helperText={
              props.errors && props.errors.length > 0 ? props.errors[props.errors.length - 1] : ''
            }
          />

          <Button
            type='submit'
            fullWidth
            variant='contained'
            color='primary'
            className={classes.submit}>
            Inloggen
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href='/forgot-password' variant='body2'>
                Wachtwoord vergeten?
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
};

const mapStateToProps = state => {
  // console.log(state);
  return {
    user: state.user,
    errors: state.user.errors,
  };
};

export default connect(mapStateToProps, { login })(SignIn);

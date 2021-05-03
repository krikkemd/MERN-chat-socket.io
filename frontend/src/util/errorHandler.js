import { useDispatch } from 'react-redux';
import { SET_ERRORS } from '../redux/types';

const dispatch = useDispatch();

const errorHandler = error => {
  return dispatch({
    type: SET_ERRORS,
    payload: 'Groepsnaam is te kort',
  });
};

export default errorHandler;

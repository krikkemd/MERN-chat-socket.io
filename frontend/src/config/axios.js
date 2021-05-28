import axios from 'axios';

// Must be set for the cookies
axios.defaults.withCredentials = true;

const instance = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}`,
});

export default instance;

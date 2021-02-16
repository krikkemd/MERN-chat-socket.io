import axios from 'axios';

// Must be set for the cookies
axios.defaults.withCredentials = true;

const instance = axios.create({
  baseURL: 'http://localhost:1337',
});

export default instance;

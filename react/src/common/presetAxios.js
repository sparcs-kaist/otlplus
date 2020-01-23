import axios from 'axios';
import Qs from 'qs';
import ReactGA from 'react-ga';

export const BASE_URL = ''; // Use Relative URL

// eslint-disable-next-line fp/no-mutation
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
// eslint-disable-next-line fp/no-mutation
axios.defaults.xsrfCookieName = 'csrftoken';

// eslint-disable-next-line fp/no-mutation
axios.defaults.paramsSerializer = params => Qs.stringify(params, { arrayFormat: 'repeat' });

axios.interceptors.request.use(
  (config) => {
    config.metadata = {
      ...config.metadata,
      startTime: new Date(),
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axios.interceptors.response.use(
  (response) => {
    response.config.metadata.endTime = new Date();
    response.config.metadata.duration = response.config.metadata.endTime - response.config.metadata.startTime;
    ReactGA.timing({
      category: response.config.metadata.gaCategory || 'Undefined',
      variable: response.config.metadata.gaVariable || 'Undefined',
      value: response.config.metadata.duration,
    });
    return response;
  },
  (error) => {
    error.config.metadata.endTime = new Date();
    error.config.metadata.duration = error.config.metadata.endTime - error.config.metadata.startTime;
  },
);

export default axios;

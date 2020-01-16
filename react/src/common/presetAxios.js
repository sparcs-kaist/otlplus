import axios from 'axios';
import Qs from 'qs';

export const BASE_URL = ''; // Use Relative URL

// eslint-disable-next-line fp/no-mutation
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
// eslint-disable-next-line fp/no-mutation
axios.defaults.xsrfCookieName = 'csrftoken';

// eslint-disable-next-line fp/no-mutation
axios.defaults.paramsSerializer = params => Qs.stringify(params, { arrayFormat: 'repeat' });

export default axios;

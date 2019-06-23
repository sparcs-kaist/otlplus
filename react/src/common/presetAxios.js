import axios from 'axios';
import Qs from 'qs';

axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'csrftoken';

axios.defaults.paramsSerializer = params => Qs.stringify(params, { arrayFormat: 'repeat' });

export default axios;

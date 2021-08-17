import hmac
import time
from secrets import token_hex
from urllib.parse import urlencode

import requests


# SPARCS SSO V2 Client Version 1.1
# VALID ONLY AFTER 2016-09-10T01:00+09:00
# Made by SPARCS SSO Team


class Client:
    SERVER_DOMAIN = 'https://sparcssso.kaist.ac.kr/'
    BETA_DOMAIN = 'https://ssobeta.sparcs.org/'
    DOMAIN = None

    API_PREFIX = 'api/'
    VERSION_PREFIX = 'v2/'
    TIMEOUT = 60

    URLS = {
        'token_require': 'token/require/',
        'token_info': 'token/info/',
        'logout': 'logout/',
        'unregister': 'unregister/',
        'point': 'point/',
        'notice': 'notice/',
    }

    def __init__(self, client_id, secret_key, is_beta=False, server_addr=''):
        """
        Initialize SPARCS SSO Client
        :param client_id: your client id
        :param secret_key: your secret key
        :param is_beta: true iff you want to use SPARCS SSO beta server
        :param server_addr: SPARCS SSO server addr (only for testing)
        """
        self.DOMAIN = self.BETA_DOMAIN if is_beta else self.SERVER_DOMAIN
        self.DOMAIN = server_addr if server_addr else self.DOMAIN

        base_url = ''.join([self.DOMAIN, self.API_PREFIX, self.VERSION_PREFIX])
        self.URLS = {k: ''.join([base_url, v]) for k, v in self.URLS.items()}

        self.client_id = client_id
        self.secret_key = secret_key.encode()

    def _sign_payload(self, payload, append_timestamp=True):
        timestamp = int(time.time())
        if append_timestamp:
            payload.append(timestamp)

        msg = ''.join(list(map(str, payload))).encode()
        sign = hmac.new(self.secret_key, msg).hexdigest()
        return sign, timestamp

    def _validate_sign(self, payload, timestamp, sign):
        sign_client, time_client = self._sign_payload(payload, False)
        if abs(time_client - int(timestamp)) > 10:
            return False
        elif hmac.compare_digest(sign_client, sign):
            return False
        return True

    def _post_data(self, url, data):
        r = requests.post(url, data)
        if r.status_code == 400:
            raise RuntimeError('INVALID_REQUEST')
        elif r.status_code == 403:
            raise RuntimeError('NO_PERMISSION')
        elif r.status_code != 200:
            raise RuntimeError('UNKNOWN_ERROR')

        try:
            return r.json()
        except Exception:
            raise RuntimeError('INVALID_OBJECT')

    def get_login_params(self):
        """
        Get login parameters for SPARCS SSO login
        :returns: [url, state] where url is a url to redirect user,
                  and state is random string to prevent CSRF
        """
        state = token_hex(10)
        params = {
            'client_id': self.client_id,
            'state': state,
        }
        url = '?'.join([self.URLS['token_require'], urlencode(params)])
        return [url, state]

    def get_user_info(self, code):
        """
        Exchange a code to user information
        :param code: the code that given by SPARCS SSO server
        :returns: a dictionary that contains user information
        """
        sign, timestamp = self._sign_payload([code])
        params = {
            'client_id': self.client_id,
            'code': code,
            'timestamp': timestamp,
            'sign': sign,
        }
        return self._post_data(self.URLS['token_info'], params)

    def get_logout_url(self, sid, redirect_uri):
        """
        Get a logout url to sign out a user
        :param sid: the user's service id
        :param redirect_uri: a redirect uri after the user sign out
        :returns: the final url to sign out a user
        """
        sign, timestamp = self._sign_payload([sid, redirect_uri])
        params = {
            'client_id': self.client_id,
            'sid': sid,
            'timestamp': timestamp,
            'redirect_uri': redirect_uri,
            'sign': sign,
        }
        return '?'.join([self.URLS['logout'], urlencode(params)])

    def get_point(self, sid):
        """
        Get a user's point
        :param sid: the user's service id
        :returns: the user's point
        """
        return self.modify_point(sid, 0, '')['point']

    def modify_point(self, sid, delta, message, lower_bound=0):
        """
        Modify a user's point
        :param sid: the user's service id
        :param delta: an increment / decrement point value
        :param message: a message that displayed to the user
        :param lower_bound: a minimum point value that required
        :returns: a server response; check the full docs
        """
        sign, timestamp = self._sign_payload([
            sid, delta, message, lower_bound,
        ])
        params = {
            'client_id': self.client_id,
            'sid': sid,
            'delta': delta,
            'message': message,
            'lower_bound': lower_bound,
            'timestamp': timestamp,
            'sign': sign,
        }
        return self._post_data(self.URLS['point'], params)

    def get_notice(self, offset=0, limit=3, date_after=0):
        """
        Get some notices from SPARCS SSO
        :param offset: a offset to fetch from
        :param limit: a number of notices to fetch
        :param date_after: an oldest date; YYYYMMDD formated string
        :returns: a server response; check the full docs
        """
        params = {
            'offset': offset,
            'limit': limit,
            'date_after': date_after,
        }
        r = requests.get(self.URLS['notice'], data=params)
        return r.json()

    def parse_unregister_request(self, data_dict):
        """
        Parse unregister request from SPARCS SSO server
        :param data_dict: a data dictionary that the server sent
        :returns: the user's service id
        :raises RuntimeError: raise iff the request is invalid
        """
        client_id = data_dict.get('client_id', '')
        sid = data_dict.get('sid', '')
        timestamp = data_dict.get('timestamp', '')
        sign = data_dict.get('sign', '')

        if client_id != self.client_id:
            raise RuntimeError('INVALID_REQUEST')
        elif not self._validate_sign([sid], timestamp, sign):
            raise RuntimeError('INVALID_REQUEST')
        return sid

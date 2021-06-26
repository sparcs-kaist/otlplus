import requests
import hmac
import time
import os
import urllib

# SPARCS SSO V2 Client Version 1.1
# VALID ONLY AFTER 2016-09-10T01:00+09:00
# Made by SPARCS SSO Team


class Client:
    SERVER_DOMAIN = "https://sparcssso.kaist.ac.kr/"
    BETA_DOMAIN = "https://ssobeta.sparcs.org/"
    DOMAIN = None

    API_PREFIX = "api/"
    VERSION_PREFIX = "v2/"

    URLS = {
        "token_require": "token/require/",
        "token_info": "token/info/",
        "logout": "logout/",
        "unregister": "unregister/",
        "point": "point/",
        "notice": "notice/",
    }

    def __init__(self, client_id, secret_key, is_beta=False, server_addr=""):
        self.DOMAIN = self.BETA_DOMAIN if is_beta else self.SERVER_DOMAIN
        self.DOMAIN = server_addr if server_addr else self.DOMAIN

        BASE_URL = "%s%s%s" % (self.DOMAIN, self.API_PREFIX, self.VERSION_PREFIX)

        tmp_URLS = dict()
        for k in self.URLS:
            tmp_URLS[k] = "%s%s" % (BASE_URL, self.URLS[k])
        self.URLS = tmp_URLS

        self.client_id = client_id
        self.secret_key = secret_key

    def _post_data(self, url, data):
        r = requests.post(url, data, verify=True)
        if r.status_code == 400:
            raise RuntimeError("INVALID_REQUEST")
        elif r.status_code == 403:
            raise RuntimeError("NO_PERMISSION")
        elif r.status_code != 200:
            raise RuntimeError("UNKNOWN_ERROR")

        try:
            return r.json()
        except Exception:
            raise RuntimeError("NOT_JSON_OBJECT")

    def get_login_params(self):
        state = os.urandom(10).encode("hex")
        params = {
            "client_id": self.client_id,
            "state": state,
        }

        return ["%s?%s" % (self.URLS["token_require"], urllib.urlencode(params)), state]

    def get_user_info(self, code):
        timestamp = int(time.time())
        sign = hmac.new(str(self.secret_key), "%s%s" % (code, timestamp)).hexdigest()

        params = {
            "client_id": self.client_id,
            "code": code,
            "timestamp": timestamp,
            "sign": sign,
        }
        return self._post_data(self.URLS["token_info"], params)

    def get_logout_url(self, sid, redirect_uri):
        timestamp = int(time.time())
        sign = hmac.new(str(self.secret_key), "%s%s%s" % (sid, redirect_uri, timestamp)).hexdigest()

        params = {
            "client_id": self.client_id,
            "sid": sid,
            "timestamp": timestamp,
            "redirect_uri": redirect_uri,
            "sign": sign,
        }
        return "%s?%s" % (self.URLS["logout"], urllib.urlencode(params))

    def do_unregister(self, sid):
        timestamp = int(time.time())
        sign = hmac.new(str(self.secret_key), "%s%s" % (sid, timestamp)).hexdigest()

        params = {
            "client_id": self.client_id,
            "sid": sid,
            "timestamp": timestamp,
            "sign": sign,
        }
        return self._post_data(self.URLS["unregister"], params)["success"]

    def get_point(self, sid):
        return self.modify_point(sid, 0, "")["point"]

    def modify_point(self, sid, delta, message, lower_bound=0):
        timestamp = int(time.time())
        sign = hmac.new(str(self.secret_key), "%s%s%s%s" % (sid, delta, lower_bound, timestamp)).hexdigest()

        params = {
            "client_id": self.client_id,
            "sid": sid,
            "delta": delta,
            "message": message,
            "lower_bound": lower_bound,
            "timestamp": timestamp,
            "sign": sign,
        }
        return self._post_data(self.URLS["point"], params)

    def get_notice(self, offset=0, limit=3, date_after=0):
        params = {
            "offset": offset,
            "limit": limit,
            "date_after": date_after,
        }
        r = requests.get(self.URLS["notice"], data=params, verify=True)
        return r.json()

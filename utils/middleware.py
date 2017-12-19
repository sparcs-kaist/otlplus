# -*- coding: utf-8 -*-
"""
User 오브젝트는 로그인한 상태라면 http request가 발생할 때마다 매번 DB로부터
읽혀온다. 따라서 그러한 처리를 cache로 처리하면 DB 부하를 줄일 수 있다.
아래 코드는 Django가 기본으로 제공하는 AuthenticationMiddleware를 완전히 대체한다.

User 오브젝트 캐시는 userid를 이용하고, post_save/post_delete signal을 이용하여
User 오브젝트가 변경될 때 해당 User에 대한 캐시를 invalidate한다.
"""

from django.core.cache import cache
from django.contrib.auth import get_user, SESSION_KEY
from django.db.models.signals import post_save, post_delete
from django.contrib.auth.models import User, AnonymousUser

class CachedAuthMiddleware(object):
    def process_request(self, request):
        assert hasattr(request, 'session'), 'Cached authentication middleware requires Session middleware to work correctly.'
        try:
            key = 'cached-user:%d' % request.session[SESSION_KEY]
        except KeyError:
            # 로그인하지 않은 상태에서는 위 키값이 존재하지 않으므로 AnonymousUser로 처리한다.
            # 로그인한 상태에서 다시 로그인할 경우 django.contrib.auth.login() 함수에서
            # 사용자가 다르면 session을 flush하고 그렇지 않으면 키만 바꾸므로 캐시는
            # 영향을 받지 않는다.
            request.user = AnonymousUser()
            return None

        user = cache.get(key)
        if user is None:
            user = get_user(request)
            cache.set(key, user, 3600)
        request.user = user
        return None

    @staticmethod
    def invalidate(user_id):
        key = 'cached-user:%d' % user_id
        cache.delete(key)

def invalidate_user_cache_after_change(sender, **kwargs):
    CachedAuthMiddleware.invalidate(kwargs['instance'].id)

post_save.connect(invalidate_user_cache_after_change, sender=User)
post_delete.connect(invalidate_user_cache_after_change, sender=User)


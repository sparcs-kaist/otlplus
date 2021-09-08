# OTL PLUS
Online Timeplanner with Lectures Plus @ KAIST https://otl.kaist.ac.kr/

## 채널
* ~~구글 드라이브 (archived): https://drive.google.com/folderview?id=0By2h7PuCHN8ZUmJ6cjQtQlJUNDA&usp=sharing~~
  * 팀원들에 한해 doc.google.com에 otlplus 공용계정: otlplus.sparcs.org@gmail.com으로 로그인해서 열람하실 수도 있습니다.
* Notion: https://www.notion.so/sparcs/OTL-Plus-69724cd9c1434d64ac379e8f6590c885
* Slack: #otl, #otl-plus, #otl-notify
* Contact: otlplus@sparcs.org

## 디자인
* ~~Invision 프로토타입 (deprecated): https://invis.io/7FATPIZHK~~
* ~~구글 드라이브 (deprecated): https://drive.google.com/drive/folders/0B7OgXXGKTmCOamtPS0NRNzFXdHc?usp=sharing~~
* XD 프로토타입: https://xd.adobe.com/view/abb6898c-eff7-42c1-b383-b9518d8c68af-fee5/?fullscreen
* XD 개발 사양: https://xd.adobe.com/view/6a2a4884-ac98-4c59-85ea-950e2f3012d6-3f79/

## 개발 환경 설정
### Django 환경 설정
Working directory: `PROJECT_ROOT`
```shell
# 가상환경 설정
$ python3 -m venv env # Python 버전 3.9 이상 권장
$ source env/bin/activate

# 패키지 설치
$ pip install -r requirements.txt

# Secret key 설정
$ mkdir keys
$ vi keys/django_secret # Random string 입력, Django SECRET_KEY 명세 참고
$ touch keys/sso_secret

# DB migrate
$ cp SOME_DIRECTORY/db.sqlite3 . # Optional, DB 파일이 필요할 경우 PM에게 요청하세요
$ python manage.py migrate
```

### SPARCS SSO 설정
SSO 설정 방법은 변경될 수 있습니다. SSO 공식 설정 방법을 참고하세요.  
URL: `sparcssso.kaist.ac.kr > Dev Center > Test Services > Register`
> Alias: (Any name)  
> Main URL: http://localhost:8000  
> Login Callback URL: http://localhost:8000/session/login/callback  
> Unregister URL: http://localhost:8000/session/unregister  
> Cooltime: 0  
> 
Working directory: `PROJECT_ROOT`
```shell
$ vi settings_local.py
```

File: `PROJECT_ROOT/settings_local.py`
```python
# ...

SSO_IS_BETA = False
SSO_CLIENT_ID = "test0000000000000000" # SSO의 'Name' 필드
SSO_SECRET_KEY = "00000000000000000000" # SSO의 'Secret Key' 필드
```

### React 환경 설정
Working directory: `PROJECT_ROOT/react`
```shell
# 패키지 설치
$ npm install

# 프로젝트 빌드
$ npm run build
```

### 서버 실행
Working directory: `PROJECT_ROOT`
```shell
$ python manage.py runserver 0.0.0.0:8000
```

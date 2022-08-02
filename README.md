# OTL PLUS
Online Timeplanner with Lectures Plus @ KAIST https://otl.kaist.ac.kr/

## 채널
* 구글 드라이브 (archived): https://drive.google.com/folderview?id=0By2h7PuCHN8ZUmJ6cjQtQlJUNDA&usp=sharing
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
$ python3 -m venv env # Python 버전 3.6 이상 권장
$ source env/bin/activate

# 패키지 설치
$ pip install -r requirements.txt # unixodbc, mysql@5.7 등을 먼저 설치해야 할 수 있음 (apt, brew 등으로 설치)

# Secret key 설정
$ mkdir keys
$ vi keys/django_secret # Random string 입력, Django SECRET_KEY 명세 참고
$ touch keys/sso_secret

# DB migrate
$ python manage.py migrate
```

### 개발용 DB 설정 (Optional)
dump 데이터는 PM에게 요청하세요.  
Working directory: `PROJECT_ROOT`
```shell
# Dump 파일 불러오기
$ python manage.py load-dev-data dumps/otldump_DATE_info.json
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
SSO_CLIENT_ID = "test0000000000000000" # SSO의 'Name' (또는 'Client ID') 필드
SSO_SECRET_KEY = "00000000000000000000" # SSO의 'Secret Key' 필드
```

### React 환경 설정
Working directory: `PROJECT_ROOT/react`
```shell
# 패키지 설치
$ npm install

# 개발 서버 실행
$ npm start

# 프로젝트 빌드
$ npm run build
```

### 서버 실행
Working directory: `PROJECT_ROOT`
```shell
$ python manage.py runserver 0.0.0.0:8000
```

### 설정 중 오류

#### DB migrate 시 "... SQLite < 3.26 ..." 오류가 발생한다면
아래 명령어로 python에 적용된 sqlite3 버전 확인
```shell
$ python -c "import sqlite3;print(sqlite3.sqlite_version)"
```
3.26.0 이하라면 높은 버전의 python으로 재설치 후 처음부터 재설정

#### node-sass 설치 시 오류가 발생한다면
1. [node-sass 호환 node.js 버전](https://github.com/sass/node-sass#node-version-support-policy)을 확인해서 적절한 버전을 사용
2. `gyp: No Xcode or CLT version detected!` 라는 메시지와 함께 설치에 실패한다면 [관련 이슈](https://github.com/schnerd/d3-scale-cluster/issues/7)의 코멘트 참고

#### mysqlclient 설치 시 오류가 발생한다면
mysql@5.7 ([5.7 버전이어야 하는 이유](https://stackoverflow.com/a/50342229)) 을 설치 후 PATH에 해당 실행 파일 디렉터리를 추가한다. 예를 들면 (macOS 기준),
```shell
$ brew install mysql@5.7
$ export PATH="/opt/homebrew/opt/mysql@5.7/bin:$PATH" # add this line to ~/.bashrc, .zshrc, etc.
```

#### 설정 완료 후 no-such-column 오류가 발생한다면
일부 조건에서 `no such column: main_famoushumanityreviewdailyfeed_reviews.review_id` 오류가 발생할 수 있음  
Working directory: `PROJECT_ROOT`
```shell
# DB 초기화
$ rm db.sqlite3
# DB migrate 재실행
$ python manage.py migrate main 0006
$ python manage.py migrate review 0009
$ python manage.py migrate
```
이후 [개발용 DB 설정](#개발용-db-설정-Optional) 재실행

#### (Apple Silicon) pip install에서 pyobdc가 설치되지 않는다면

```bash
/otlplus/include -arch arm64 -I/opt/homebrew/Caskroom/miniconda/base/envs/otlplus/include -arch arm64 -DPYODBC_VERSION=4.0.32 -UMAC_OS_X_VERSION_10_7 -I/opt/homebrew/Caskroom/miniconda/base/envs/otlplus/include/python3.8 -c src/buffer.cpp -o build/temp.macosx-11.1-arm64-3.8/src/buffer.o -Wno-write-strings -Wno-deprecated-declarations
      In file included from src/buffer.cpp:12:
      src/pyodbc.h:56:10: fatal error: 'sql.h' file not found
      #include <sql.h>
               ^~~~~~~
      1 error generated.
      error: command '/usr/bin/gcc' failed with exit code 1
      [end of output]
  
  note: This error originates from a subprocess, and is likely not a problem with pip.
error: legacy-install-failure

× Encountered error while trying to install package.
╰─> pyodbc

note: This is an issue with the package mentioned above, not pip.
hint: See above for output from the failure.
```

[https://github.com/mkleehammer/pyodbc/issues/846#issuecomment-1122715983](https://github.com/mkleehammer/pyodbc/issues/846#issuecomment-1122715983) 참조

```sh
brew install unixodbc
export LDFLAGS="-L/opt/homebrew/lib"
export CFLAGS="-I/opt/homebrew/include"
export CPPFLAGS="-I/opt/homebrew/include"
pip install -r requirements.txt
```

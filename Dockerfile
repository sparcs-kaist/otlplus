FROM python:3.8

ENV PYTHONUNBUFFERED 1

RUN apt-get -y update && apt-get install unixodbc-dev -y && apt-get clean
RUN pip install --upgrade pip

RUN mkdir /back
WORKDIR /back
ADD ./requirements.txt ./requirements.txt
RUN pip install -r requirements.txt

ADD . .

EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

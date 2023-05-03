FROM python:3.8

ENV PYTHONUNBUFFERED 1

RUN apt-get -y update && apt-get install unixodbc-dev -y && apt-get clean
RUN pip install --upgrade pip

RUN mkdir -p /var/www/otlplus
RUN mkdir /var/www/otlplus/logs
WORKDIR /var/www/otlplus
ADD ./requirements.txt ./requirements.txt
RUN pip install -r requirements.txt

ADD . .

EXPOSE 8000

ADD ./volumes/config /root/.ssh/config
ADD ./volumes/key.pem /root/key.pem
RUN chown -R root:root /root && chmod 400 /root/key.pem && echo "StrictHostKeyChecking no" >> /etc/ssh_config

CMD ["gunicorn", "otlplus.wsgi", "--bind", "0.0.0.0:8000"]

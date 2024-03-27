FROM ubuntu:latest

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y python3 python3-pip pkg-config libmysqlclient-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /JewishPositivity

COPY . .

RUN pip3 install -r requirements.txt

WORKDIR /JewishPositivity/JP_Django

EXPOSE 8000

CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]

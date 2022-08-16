# syntax=docker/dockerfile:1
FROM ubuntu:22.04

# install app dependencies
RUN apt-get update
RUN apt-get install -y python3 python3-pip
RUN pip install Flask
RUN pip install numpy
RUN pip install pandas
RUN pip install flask_cors

# install app
COPY . ./

# final configuration
ENV FLASK_APP=app
EXPOSE 5000
CMD python3 .\app.py
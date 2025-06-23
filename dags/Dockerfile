FROM apache/airflow:2.9.1

USER root

RUN apt-get update && \
    apt-get install -y default-jdk && \
    apt-get clean


# Set JAVA_HOME environment variable
ENV JAVA_HOME=/usr/lib/jvm/default-java
ENV PATH=$JAVA_HOME/bin:$PATH

USER airflow
RUN pip install --upgrade pip
RUN pip install pyhive thrift thrift_sasl pyspark neo4j pandas

FROM postgres:17

WORKDIR /postgres

RUN apt-get update && apt-get install -y postgresql-17-pgtap 

CMD ["postgres", "-c", "shared_preload_libraries=pg_stat_statements", "-c", "pg_stat_statements.track=all"]

COPY create/ /docker-entrypoint-initdb.d/
COPY store_procedures/ /docker-entrypoint-initdb.d/

RUN chmod 644 /docker-entrypoint-initdb.d/*.sql

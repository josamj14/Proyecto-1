FROM mongo

WORKDIR /usr/src/configs

COPY init-config.js .
COPY init-shard1.js .
COPY init-shard2.js .
COPY init-shard3.js .
COPY init.js .
COPY data.js .

COPY setup.sh .

RUN chmod +x /usr/src/configs/setup.sh
CMD ["./setup.sh"]

FROM douglaspinheiro/ubuntu-node
MAINTAINER Douglas Pinheiro
RUN apt-get install -y mysql-client
ENV TZ=America/Sao_Paulo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
#!/bin/bash
dnf update -y
dnf install -y docker git
systemctl enable --now docker
usermod -aG docker ec2-user

curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

cd /home/ec2-user
git clone https://github.com/kuroda1995/github-demo.git app
cd app

# Amazon Linux 2023同梱のDockerはbuildxが古く、docker-composeのビルドがそのままでは失敗するため、
# 従来方式のビルド(BuildKit無効)に切り替える
DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 docker-compose up -d --build

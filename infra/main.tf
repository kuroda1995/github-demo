# すでにアカウントにあるDefault VPC/サブネットを参照する(新規作成しない)
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# 最新のAmazon Linux 2023 AMI(サーバーの雛形イメージ)を検索
data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

resource "aws_security_group" "app" {
  name        = "${var.project_name}-sg"
  description = "Allow SSH from my IP, HTTP from anywhere"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip_cidr]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_key_pair" "deployer" {
  key_name   = "${var.project_name}-key"
  public_key = file(var.ssh_public_key_path)
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = var.instance_type
  subnet_id              = data.aws_subnets.default.ids[0]
  vpc_security_group_ids = [aws_security_group.app.id]
  key_name               = aws_key_pair.deployer.key_name
  user_data              = file("${path.module}/user_data.sh")

  # ルートボリュームのサイズを明示し、無料利用枠(30GB-月)を超えないようにする
  root_block_device {
    volume_type = "gp3"
    volume_size = var.root_volume_size_gb
  }

  tags = {
    Name = "${var.project_name}-server"
  }
}

# --- RDS(PostgreSQL): EC2上のDockerコンテナで動かしていたDBを、AWSのマネージドDBへ切り出す ---

# RDSはDefault VPC内の複数のサブネット(異なるAZ)にまたがって配置する必要があるため、
# EC2で使っているのと同じDefault VPCのサブネット一覧をそのまま使う
resource "aws_db_subnet_group" "app" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = data.aws_subnets.default.ids

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

# RDS専用のセキュリティグループ。5432番はEC2のセキュリティグループ(aws_security_group.app)からの
# 通信だけを許可し、IPアドレスやインターネット全体には一切開放しない
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "Allow PostgreSQL only from the app EC2 instance"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description     = "PostgreSQL from the app EC2 security group only"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}

resource "aws_db_instance" "app" {
  identifier     = "${var.project_name}-db"
  engine         = "postgres"
  engine_version = "16"
  # 無料利用枠の対象(750時間/月まで無料)。マルチAZにすると無料枠の対象外になるため、あえてシングルAZ構成にする
  instance_class = "db.t3.micro"
  multi_az       = false

  # 無料利用枠(20GB-月まで無料)ちょうど
  allocated_storage = 20
  storage_type      = "gp2"

  db_name  = "trello"
  username = "postgres"
  password = var.db_master_password

  db_subnet_group_name   = aws_db_subnet_group.app.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  # インターネットから直接アクセスできないようにする(EC2経由でのみ到達可能)
  publicly_accessible = false

  backup_retention_period = 1
  skip_final_snapshot     = true
  deletion_protection     = false

  tags = {
    Name = "${var.project_name}-db"
  }
}

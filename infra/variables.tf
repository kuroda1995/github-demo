variable "aws_region" {
  default = "ap-northeast-1"
}

variable "project_name" {
  default = "github-demo"
}

variable "instance_type" {
  default = "t3.micro" # 無料利用枠の対象(750時間/月まで無料)
}

variable "root_volume_size_gb" {
  default = 30 # Amazon Linux 2023 AMIのスナップショットが30GB以上を要求するため。無料利用枠(30GB-月まで無料)ちょうど
}

variable "my_ip_cidr" {
  description = "SSH接続を許可する自分のPCのグローバルIP。例: 203.0.113.10/32"
  type        = string
}

variable "ssh_public_key_path" {
  default = "~/.ssh/id_rsa.pub"
}

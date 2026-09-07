output "public_ip" {
  value       = aws_instance.app.public_ip
  description = "ブラウザでアクセスするIPアドレス"
}

output "rds_endpoint" {
  value       = aws_db_instance.app.address
  description = "RDSの接続先ホスト名(EC2からのみ到達可能)"
}

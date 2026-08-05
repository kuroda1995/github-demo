INSERT INTO board_columns (id, name, sort_order) VALUES ('todo', '未着手', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO board_columns (id, name, sort_order) VALUES ('doing', '進行中', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO board_columns (id, name, sort_order) VALUES ('done', '完了', 2) ON CONFLICT (id) DO NOTHING;

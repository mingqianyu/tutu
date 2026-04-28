-- =====================================================
-- 宝宝日常 - 数据库初始化脚本
-- =====================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS tutu_baby DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tutu_baby;

-- =====================================================
-- 1. 用户表
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '登录用户名',
  password VARCHAR(255) NOT NULL COMMENT 'bcrypt 加密密码',
  nickname VARCHAR(50) NOT NULL DEFAULT '' COMMENT '昵称',
  avatar VARCHAR(500) DEFAULT NULL COMMENT '头像 URL',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- =====================================================
-- 2. 宝宝表
-- =====================================================
CREATE TABLE IF NOT EXISTS babies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL COMMENT '所属用户 ID',
  nickname VARCHAR(50) NOT NULL COMMENT '宝宝小名',
  gender ENUM('male', 'female') NOT NULL COMMENT '性别',
  birthday DATE NOT NULL COMMENT '出生日期',
  birth_method ENUM('natural', 'cesarean', 'other') NOT NULL DEFAULT 'natural' COMMENT '生产方式',
  avatar VARCHAR(500) DEFAULT NULL COMMENT '宝宝头像',
  background VARCHAR(500) DEFAULT NULL COMMENT '背景图',
  relation VARCHAR(20) DEFAULT NULL COMMENT '与宝宝关系（dad/mom/grandpa/grandma/maternal_grandpa/maternal_grandma/other）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宝宝表';

-- =====================================================
-- 3. 喂养记录表
-- =====================================================
CREATE TABLE IF NOT EXISTS feeding_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  baby_id INT NOT NULL COMMENT '宝宝 ID',
  user_id INT NOT NULL COMMENT '记录人 ID',
  type ENUM('breast_milk', 'bottle_milk', 'formula', 'solid_food', 'water', 'diaper', 'sleep') NOT NULL COMMENT '记录类型',
  start_time DATETIME NOT NULL COMMENT '开始时间',
  end_time DATETIME DEFAULT NULL COMMENT '结束时间',
  duration INT DEFAULT NULL COMMENT '持续时长（秒）',
  amount DECIMAL(10, 1) DEFAULT NULL COMMENT '数量/容量',
  unit VARCHAR(10) DEFAULT NULL COMMENT '单位（ml/g 等）',
  side ENUM('left', 'right', 'both') DEFAULT NULL COMMENT '哺乳侧（母乳）',
  last_side ENUM('left', 'right') DEFAULT NULL COMMENT '上次哺乳侧',
  left_duration INT DEFAULT NULL COMMENT '左侧哺乳时长（秒）',
  right_duration INT DEFAULT NULL COMMENT '右侧哺乳时长（秒）',
  food_name VARCHAR(100) DEFAULT NULL COMMENT '辅食名称',
  allergies JSON DEFAULT NULL COMMENT '过敏食材列表',
  diaper_status ENUM('pee', 'poop', 'poop_pee') DEFAULT NULL COMMENT '尿布状态',
  has_rash TINYINT(1) DEFAULT 0 COMMENT '红屁屁',
  note TEXT DEFAULT NULL COMMENT '备注',
  is_ongoing TINYINT(1) DEFAULT 0 COMMENT '是否进行中（睡眠/母乳计时）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_baby_time (baby_id, start_time),
  INDEX idx_baby_type (baby_id, type),
  FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='喂养记录表';

-- =====================================================
-- 4. 云相册媒体表
-- =====================================================
CREATE TABLE IF NOT EXISTS media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  baby_id INT NOT NULL COMMENT '宝宝 ID',
  user_id INT NOT NULL COMMENT '上传人 ID',
  type ENUM('photo', 'video') NOT NULL DEFAULT 'photo' COMMENT '媒体类型',
  url VARCHAR(500) NOT NULL COMMENT '文件 URL',
  thumbnail_url VARCHAR(500) DEFAULT NULL COMMENT '缩略图 URL',
  note TEXT DEFAULT NULL COMMENT '备注/描述',
  duration INT DEFAULT NULL COMMENT '视频时长（秒）',
  file_size INT DEFAULT NULL COMMENT '文件大小（字节）',
  taken_at DATETIME NOT NULL COMMENT '拍摄时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_baby_taken (baby_id, taken_at),
  INDEX idx_baby_type (baby_id, type),
  FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='云相册媒体表';

-- =====================================================
-- 预置数据
-- =====================================================

-- 预置用户：tutu / tutu0725
-- bcrypt hash of 'tutu0725' with 10 rounds
INSERT INTO users (username, password, nickname) VALUES
('tutu', '$2a$10$RHI089nRHlX2zdXI1KAQruRQtKAjLrlIHUpdqGuPSBGdxXwXFkDt6', '图图爸爸');

-- 预置宝宝"图图"
INSERT INTO babies (user_id, nickname, gender, birthday, birth_method, relation) VALUES
(1, '图图', 'female', '2025-07-25', 'natural', 'dad');

-- =====================================================
-- 预置喂养记录（3天，共 35 条）
-- =====================================================

-- 第 1 天：2026-02-28
INSERT INTO feeding_records (baby_id, user_id, type, start_time, end_time, duration, amount, unit, side, note) VALUES
(1, 1, 'breast_milk', '2026-02-28 06:30:00', '2026-02-28 06:50:00', 1200, NULL, NULL, 'left', '早起第一顿'),
(1, 1, 'diaper', '2026-02-28 07:00:00', NULL, NULL, NULL, NULL, NULL, NULL),
(1, 1, 'formula', '2026-02-28 09:30:00', '2026-02-28 09:45:00', 900, 120, 'ml', NULL, NULL),
(1, 1, 'sleep', '2026-02-28 10:00:00', '2026-02-28 11:30:00', 5400, NULL, NULL, NULL, '上午小睡'),
(1, 1, 'solid_food', '2026-02-28 12:00:00', '2026-02-28 12:20:00', 1200, 30, 'g', NULL, NULL),
(1, 1, 'water', '2026-02-28 12:30:00', NULL, NULL, 50, 'ml', NULL, NULL),
(1, 1, 'breast_milk', '2026-02-28 14:00:00', '2026-02-28 14:25:00', 1500, NULL, NULL, 'right', NULL),
(1, 1, 'diaper', '2026-02-28 14:30:00', NULL, NULL, NULL, NULL, NULL, NULL),
(1, 1, 'sleep', '2026-02-28 15:00:00', '2026-02-28 16:30:00', 5400, NULL, NULL, NULL, '下午小睡'),
(1, 1, 'formula', '2026-02-28 17:00:00', '2026-02-28 17:15:00', 900, 150, 'ml', NULL, NULL),
(1, 1, 'diaper', '2026-02-28 18:00:00', NULL, NULL, NULL, NULL, NULL, NULL),
(1, 1, 'breast_milk', '2026-02-28 20:00:00', '2026-02-28 20:30:00', 1800, NULL, NULL, 'both', '睡前奶');

-- 更新尿布记录的状态
UPDATE feeding_records SET diaper_status = 'pee' WHERE type = 'diaper' AND start_time = '2026-02-28 07:00:00';
UPDATE feeding_records SET diaper_status = 'poop_pee' WHERE type = 'diaper' AND start_time = '2026-02-28 14:30:00';
UPDATE feeding_records SET diaper_status = 'pee' WHERE type = 'diaper' AND start_time = '2026-02-28 18:00:00';

-- 更新辅食名称
UPDATE feeding_records SET food_name = '南瓜泥' WHERE type = 'solid_food' AND start_time = '2026-02-28 12:00:00';

-- 更新母乳记录的左右哺乳时长
UPDATE feeding_records SET left_duration = 1200, last_side = 'left' WHERE type = 'breast_milk' AND start_time = '2026-02-28 06:30:00';
UPDATE feeding_records SET right_duration = 1500, last_side = 'right' WHERE type = 'breast_milk' AND start_time = '2026-02-28 14:00:00';
UPDATE feeding_records SET left_duration = 900, right_duration = 900, last_side = 'right' WHERE type = 'breast_milk' AND start_time = '2026-02-28 20:00:00';
UPDATE feeding_records SET left_duration = 1500, last_side = 'left' WHERE type = 'breast_milk' AND start_time = '2026-03-01 06:00:00';
UPDATE feeding_records SET left_duration = 900, right_duration = 900, last_side = 'right' WHERE type = 'breast_milk' AND start_time = '2026-03-01 13:30:00';
UPDATE feeding_records SET right_duration = 1800, last_side = 'right' WHERE type = 'breast_milk' AND start_time = '2026-03-02 05:30:00';
UPDATE feeding_records SET left_duration = 1200, last_side = 'left' WHERE type = 'breast_milk' AND start_time = '2026-03-02 13:00:00';

-- 第 2 天：2026-03-01
INSERT INTO feeding_records (baby_id, user_id, type, start_time, end_time, duration, amount, unit, side, food_name, diaper_status, note) VALUES
(1, 1, 'breast_milk', '2026-03-01 06:00:00', '2026-03-01 06:25:00', 1500, NULL, NULL, 'left', NULL, NULL, '早起喂奶'),
(1, 1, 'diaper', '2026-03-01 06:30:00', NULL, NULL, NULL, NULL, NULL, NULL, 'pee', NULL),
(1, 1, 'formula', '2026-03-01 09:00:00', '2026-03-01 09:20:00', 1200, 130, 'ml', NULL, NULL, NULL, NULL),
(1, 1, 'sleep', '2026-03-01 09:30:00', '2026-03-01 11:00:00', 5400, NULL, NULL, NULL, NULL, NULL, '上午小睡'),
(1, 1, 'solid_food', '2026-03-01 11:30:00', '2026-03-01 11:50:00', 1200, 40, 'g', NULL, '胡萝卜泥', NULL, '吃得很好'),
(1, 1, 'water', '2026-03-01 12:00:00', NULL, NULL, 60, 'ml', NULL, NULL, NULL, NULL),
(1, 1, 'diaper', '2026-03-01 12:30:00', NULL, NULL, NULL, NULL, NULL, NULL, 'poop', NULL),
(1, 1, 'breast_milk', '2026-03-01 13:30:00', '2026-03-01 14:00:00', 1800, NULL, NULL, 'both', NULL, NULL, NULL),
(1, 1, 'sleep', '2026-03-01 14:30:00', '2026-03-01 16:00:00', 5400, NULL, NULL, NULL, NULL, NULL, '下午小睡'),
(1, 1, 'bottle_milk', '2026-03-01 16:30:00', '2026-03-01 16:45:00', 900, 100, 'ml', NULL, NULL, NULL, '瓶喂母乳'),
(1, 1, 'diaper', '2026-03-01 17:30:00', NULL, NULL, NULL, NULL, NULL, NULL, 'poop_pee', NULL),
(1, 1, 'formula', '2026-03-01 19:30:00', '2026-03-01 19:50:00', 1200, 150, 'ml', NULL, NULL, NULL, '睡前奶');

-- 第 3 天：2026-03-02（今天）
INSERT INTO feeding_records (baby_id, user_id, type, start_time, end_time, duration, amount, unit, side, food_name, diaper_status, note) VALUES
(1, 1, 'breast_milk', '2026-03-02 05:30:00', '2026-03-02 06:00:00', 1800, NULL, NULL, 'right', NULL, NULL, '凌晨夜奶'),
(1, 1, 'diaper', '2026-03-02 06:30:00', NULL, NULL, NULL, NULL, NULL, NULL, 'pee', NULL),
(1, 1, 'formula', '2026-03-02 08:30:00', '2026-03-02 08:50:00', 1200, 140, 'ml', NULL, NULL, NULL, NULL),
(1, 1, 'sleep', '2026-03-02 09:00:00', '2026-03-02 10:30:00', 5400, NULL, NULL, NULL, NULL, NULL, '上午小睡'),
(1, 1, 'solid_food', '2026-03-02 11:00:00', '2026-03-02 11:25:00', 1500, 35, 'g', NULL, '苹果泥', NULL, NULL),
(1, 1, 'water', '2026-03-02 11:30:00', NULL, NULL, 40, 'ml', NULL, NULL, NULL, NULL),
(1, 1, 'breast_milk', '2026-03-02 13:00:00', '2026-03-02 13:20:00', 1200, NULL, NULL, 'left', NULL, NULL, NULL),
(1, 1, 'diaper', '2026-03-02 13:30:00', NULL, NULL, NULL, NULL, NULL, NULL, 'poop_pee', '有点红屁屁'),
(1, 1, 'sleep', '2026-03-02 14:00:00', '2026-03-02 15:45:00', 6300, NULL, NULL, NULL, NULL, NULL, '下午小睡'),
(1, 1, 'formula', '2026-03-02 16:00:00', '2026-03-02 16:15:00', 900, 130, 'ml', NULL, NULL, NULL, NULL),
(1, 1, 'diaper', '2026-03-02 17:00:00', NULL, NULL, NULL, NULL, NULL, NULL, 'pee', NULL);

-- 更新红屁屁记录
UPDATE feeding_records SET has_rash = 1 WHERE note = '有点红屁屁';

-- =====================================================
-- 预置云相册记录（5 条）
-- =====================================================
INSERT INTO media (baby_id, user_id, type, url, thumbnail_url, note, taken_at) VALUES
(1, 1, 'photo', '/uploads/placeholder-1.jpg', '/uploads/placeholder-1-thumb.jpg', '图图的第一张照片', '2025-08-15 10:00:00'),
(1, 1, 'photo', '/uploads/placeholder-2.jpg', '/uploads/placeholder-2-thumb.jpg', '满月照', '2025-09-15 14:00:00'),
(1, 1, 'photo', '/uploads/placeholder-3.jpg', '/uploads/placeholder-3-thumb.jpg', '百天照', '2025-11-23 10:00:00'),
(1, 1, 'video', '/uploads/placeholder-4.mp4', '/uploads/placeholder-4-thumb.jpg', '第一次翻身', '2025-12-20 16:30:00'),
(1, 1, 'photo', '/uploads/placeholder-5.jpg', '/uploads/placeholder-5-thumb.jpg', '六个月了', '2026-02-15 09:00:00');

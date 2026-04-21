-- Run once if you already created `users` without UNIQUE on phone:
-- USE lipamove;
-- Fix duplicate phones manually before running, if any.

ALTER TABLE users
  ADD UNIQUE KEY uq_users_phone (phone);

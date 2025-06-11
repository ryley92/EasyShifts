-- User password backup before migration
-- Created: 2025-06-11T00:40:46.189531

-- User: admin
UPDATE users SET password = 'Hdfatboy1!' WHERE id = 1;

-- User: employee
UPDATE users SET password = 'pass' WHERE id = 2;

-- User: addy
UPDATE users SET password = 'pass' WHERE id = 3;

-- User: manager
UPDATE users SET password = 'password' WHERE id = 9;

-- User: test_emp_ws
UPDATE users SET password = 'password123' WHERE id = 10;

-- User: eddie
UPDATE users SET password = 'CantWin1!' WHERE id = 11;


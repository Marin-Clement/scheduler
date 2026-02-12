-- Seed default leave types for each organization
-- Idempotent migration: safe to run multiple times

-- 1) Ensure each org has the 4 default leave types
WITH default_leave_types AS (
    SELECT *
    FROM (
        VALUES
            ('PAID', 'Paid Leave', '#3B82F6', 2.08::DECIMAL(5,2)),
            ('UNPAID', 'Unpaid Leave', '#F59E0B', 0::DECIMAL(5,2)),
            ('SICK', 'Sick Leave', '#EF4444', 0::DECIMAL(5,2)),
            ('REMOTE', 'Remote Work', '#3B82F6', 0::DECIMAL(5,2))
    ) AS t(code, name, color, default_monthly_increment)
)
INSERT INTO leave_types (org_id, code, name, color, default_monthly_increment)
SELECT
    o.id,
    d.code,
    d.name,
    d.color,
    d.default_monthly_increment
FROM orgs o
CROSS JOIN default_leave_types d
WHERE NOT EXISTS (
    SELECT 1
    FROM leave_types lt
    WHERE lt.org_id = o.id
      AND UPPER(COALESCE(lt.code, '')) = d.code
);

-- 2) Ensure each profile has a balance row for each leave type of its org
--    (lets UI show all types consistently even before manual allocation)
INSERT INTO leave_balances (profile_id, org_id, leave_type_id, balance, monthly_increment)
SELECT
    p.id,
    p.org_id,
    lt.id,
    0,
    COALESCE(lt.default_monthly_increment, 0)
FROM profiles p
JOIN leave_types lt
  ON lt.org_id = p.org_id
WHERE NOT EXISTS (
    SELECT 1
    FROM leave_balances lb
    WHERE lb.profile_id = p.id
      AND lb.leave_type_id = lt.id
);

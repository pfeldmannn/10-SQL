SELECT e.id, e.first_name, e.last_name, r.title as position, r.salary, d.name as department, 
CONCAT(m.first_name, ' ', m.last_name) as manager from employee e LEFT JOIN role r ON e.role_id = r.id LEFT JOIN department d ON r.department_id = d.id LEFT JOIN employee m ON e.manager_id = m.id;

SELECT r.title, r.id, r.salary, d.name as department from role r LEFT JOIN department d ON r.department_id = d.id;
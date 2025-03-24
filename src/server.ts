import inquirer from "inquirer";
import { QueryResult } from "pg";
import { pool, connectToDb } from "./connection.js";
import "console.table";

await connectToDb();
//prompt the user
const init = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          "View all departments",
          "View all roles",
          "View all employees",
          "Add a department",
          "Add a role",
          "Add an employee",
          "Update an employee role",
          "Exit",
        ],
      },
    ])
    .then((res: any) => {
      //view all departments (names and ids)
      const { action } = res;
      if (action === "View all departments") {
        pool.query(
          `SELECT * FROM department`,
          (err: Error, result: QueryResult) => {
            if (err) {
              console.log(err);
            } else if (result) {
              console.table(result.rows);
              init();
            }
          }
        );
      //view all roles (job title, role id, the department that role belongs to, and the salary for that role)
      } else if (action === "View all roles") {
        pool.query(
          `SELECT r.title, r.id, r.salary, d.name as department from role r LEFT JOIN department d ON r.department_id = d.id;`,
          (err: Error, result: QueryResult) => {
            if (err) {
              console.log(err);
            } else if (result) {
              console.table(result.rows);
              init();
            }
          }
        );
      // view all employees (employee data, including employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to)
      } else if (action === "View all employees") {
        pool.query(
          `SELECT e.id, e.first_name, e.last_name, r.title as position, r.salary, d.name as department, CONCAT(m.first_name, ' ', m.last_name) as manager from employee e LEFT JOIN role r ON e.role_id = r.id LEFT JOIN department d ON r.department_id = d.id LEFT JOIN employee m ON e.manager_id = m.id;`,
          (err: Error, result: QueryResult) => {
            if (err) {
              console.log(err);
            } else if (result) {
              console.table(result.rows);
              init();
            }
          }
        );
      // add a department (prompted to enter name of department then that department is added to the database)
      } else if (action === "Add a department") {
        inquirer
          .prompt([
            {
              type: "input",
              name: "name",
              message: "What is the name of the department you want to add?",
            },
          ])
          .then((res: any) => {
            const { name } = res;
            const sql = `INSERT INTO department (name) VALUES ($1)`;

            pool.query(sql, [name], (err: Error, result: QueryResult) => {
              if (err) {
                console.log(err);
              } else if (result) {
                console.log("Department added!");
                init();
              }
            });
          });
      // add a role (prompted to enter name, salary, and department for the role and that role is added to the database)
      } else if (action === "Add a role") {
        pool.query(
          `SELECT * FROM department`,
          (err: Error, result: QueryResult) => {
            if (err) {
              console.log(err);
            } else if (result) {
              const departmentChoices = result.rows.map((department: any) => ({
                name: department.name,
                value: department.id,
              }));

              inquirer
                .prompt([
                  {
                    type: "input",
                    name: "name",
                    message: "What is the name of the role you want to add?",
                  },
                  {
                    type: "input",
                    name: "salary",
                    message: "What is the salary for this role?",
                  },
                  {
                    type: "list",
                    name: "department_id",
                    message: "What is the department for this role?",
                    choices: departmentChoices,
                  },
                ])
                .then((res: any) => {
                  const { name, salary, department_id } = res;
                  const sql = `INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)`;
                  pool.query(
                    sql,
                    [name, salary, department_id],
                    (err: Error, result: QueryResult) => {
                      if (err) {
                        console.log(err);
                      } else if (result) {
                        console.log("Role added!");
                        init();
                      }
                    }
                  );
                });
            }
          }
        );
      // add an employee (prompted to enter employee’s first name, last name, role, and manager and that employee is added to the database)
      } else if (action === "Add an employee") {
        pool.query(`SELECT * FROM role`, (err: Error, result: QueryResult) => {
          if (err) {
            console.log(err);
          } else if (result) {
            const roleChoices = result.rows.map((role: any) => ({
              name: role.title,
              value: role.id,
            }));
            pool.query(
              `SELECT * FROM employee`,
              (err: Error, result: QueryResult) => {
                if (err) {
                  console.log(err);
                } else if (result) {
                  const employeeChoices = result.rows.map((employee: any) => ({
                    name: employee.first_name + " " + employee.last_name,
                    value: employee.id,
                  }));
                  inquirer
                    .prompt([
                      {
                        type: "input",
                        name: "first_name",
                        message: "What is the first name of the employee?",
                      },
                      {
                        type: "input",
                        name: "last_name",
                        message: "What is the last name of the employee?",
                      },
                      {
                        type: "list",
                        name: "role_id",
                        message: "What is the role for the employee?",
                        choices: roleChoices,
                      },
                      {
                        type: "list",
                        name: "manager_id",
                        message: "What is the manager for the employee?",
                        choices: employeeChoices,
                      },
                    ])
                    .then((res: any) => {
                      const { first_name, last_name, role_id, manager_id } =
                        res;
                      const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)`;
                      pool.query(
                        sql,
                        [first_name, last_name, role_id, manager_id],
                        (err: Error, result: QueryResult) => {
                          if (err) {
                            console.log(err);
                          } else if (result) {
                            console.log("Employee added!");
                            init();
                          }
                        }
                      );
                    });
                }
              }
            );
          }
        });
      // update an employee role (prompted to select an employee to update and their new role and this information is updated in the database)
      } else if (action === 'Update an employee role') {
        pool.query(`SELECT * FROM employee`, (err: Error, result: QueryResult) => {
          if (err) {
            console.log(err);
          } else if (result) {
            const employeeChoices = result.rows.map((employee: any) => ({
              name: employee.first_name + " " + employee.last_name,
              value: employee.id,
            }));
            pool.query(`SELECT * FROM role`, (err: Error, result: QueryResult) => {
              if (err) {
                console.log(err);
              } else if (result) {
                const roleChoices = result.rows.map((role: any) => ({
                  name: role.title,
                  value: role.id,
                }));
                inquirer.prompt([
                  {
                    type: "list",
                    name: "employee_id",
                    message: "Which employee would you like to update?",
                    choices: employeeChoices,
                  },
                  {
                    type: "list",
                    name: "role_id",
                    message: "What is the new role for the employee?",
                    choices: roleChoices,
                  },
                ]).then((res: any) => {
                  const { employee_id, role_id } = res;
                  const sql = `UPDATE employee SET role_id = $1 WHERE id = $2`;
                  pool.query(sql, [role_id, employee_id], (err: Error, result: QueryResult) => {
                    if (err) {
                      console.log(err);
                    } else if (result) {
                      console.log("Employee role updated!");
                      init();
                    }
                  });
                });
              }
            });
          }
        });
      } else {
        console.log("Goodbye!");
        pool.end();
        process.exit(1);
      }
    });
};

init();














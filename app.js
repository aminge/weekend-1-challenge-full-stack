var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var pg = require('pg');

var connectionString = '';

if(process.env.DATABASE_URL != undefined) {
    connectionString = process.env.DATABASE_URL + 'ssl';
} else {
    connectionString = 'postgres://localhost:5432/employee_salary';
}

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.set('port', process.env.PORT || 5000);

app.post('/employee', function(req, res) {
    var addEmployee = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        employee_id: req.body.employee_id,
        job_title: req.body.job_title,
        yearly_salary: req.body.yearly_salary,
        active: req.body.active
    };

    pg.connect(connectionString, function(err, client, done) {
        client.query("INSERT INTO employee_salary (first_name, last_name, employee_id, job_title, " +
            "yearly_salary, active) VALUES ($1, $2, $3, $4, $5, $6)",
            [addEmployee.first_name, addEmployee.last_name, addEmployee.employee_id, addEmployee.job_title,
                addEmployee.yearly_salary, true],
            function (err, result) {
                done();
                if(err) {
                    console.log('Error inserting data: ', err);
                    res.send(false);
                } else {
                    res.send(addEmployee);
                }
            }
        );
    });
});

app.get('/employees', function(req, res) {

    var results = [];

    pg.connect(connectionString, function(err, client, done) {
        var query = client.query('SELECT * FROM employee_salary ORDER BY first_name DESC;');

        query.on('row', function(row) {
            results.push(row);
        });

        query.on('end', function() {
            done();
            return res.json(results);
        });

        if(err) {
            console.log(err);
        }
    });
});

app.get('/totalactivesalary', function(req, res) {
    var results = [];
    pg.connect(connectionString, function(err, client, done) {
        var query = client.query('SELECT sum(CASE WHEN active = true THEN yearly_salary ELSE 0 END) ' +
            'as total_salary FROM employee_salary');

        query.on('row', function(row) {
            results.push(row);
        });

        query.on('end', function() {
            done();
            return res.json(results);
        });

        if(err) {
            console.log(err);
        }
    });
});

app.post('/deactivate', function(req, res) {
    pg.connect(connectionString, function(err, client, done) {
        var employee_id = req.body.employee_id;
        client.query('UPDATE employee_salary SET active = false WHERE employee_id = ' + employee_id,
            function(err, result) {
                done();
                if(err) {
                    console.log('Error deactivating employee');
                    res.send(false);
                } else {
                    res.send(result);
                }
            }
        );
    });
});

app.post('/activate', function(req, res) {
    console.log("Received request to activate employee");
    pg.connect(connectionString, function(err, client, done) {
        var employee_id = req.body.employee_id;
        client.query('UPDATE employee_salary SET active = true WHERE employee_id = ' + employee_id,
            function(err, result) {
                done();
                if(err) {
                    console.log('Error activating employee');
                    res.send(false);
                } else {
                    res.send(result);
                }
            }
        );
    });
});

app.get('/*', function(req, res) {
    console.log("Here is the request: " , req.params);
    var file = req.params[0] || '/views/index.html';
    res.sendFile(path.join(__dirname, './public/', file));
});

app.listen(app.get('port'), function() {
    console.log('Server is ready on port ' + app.get('port'));
});
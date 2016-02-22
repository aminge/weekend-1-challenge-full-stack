$(document).ready(function() {

	loadEmployees();
	updateTotal();

	$('#employeeForm').on('submit', submitEmployee);
	$('body').on('click', '.change-active-status', function() {

		if ($(this).hasClass('active')) {
			deactivateEmployee($(this));
		} else if ($(this).hasClass('inactive')) {
			activateEmployee($(this));
		}
		updateTotal();
	});
});

function appendDom(empInfo) {
	$('#container').append('<div class="employee"></div>');
	var $el = $('#container').children().last();

	$el.append('<p>' + empInfo.first_name + '</p>');
	$el.append('<p>' + empInfo.last_name + '</p>');
	$el.append('<p>' + empInfo.employee_id + '</p>');
	$el.append('<p>' + empInfo.job_title + '</p>');
	$el.append('<p>' + empInfo.yearly_salary + '</p>');

	if (empInfo.active === true) {
		console.log(empInfo.first_name + ' is active' + empInfo.active);
		$el.append('<button data-id="' + empInfo.employee_id + '" class="change-active-status">' +
			'Status: Active</button>');
		$el.children().last().addClass('active');

	} else if (empInfo.active === false) {
		$el.append('<button data-id="' + empInfo.employee_id + '" class="change-active-status">' +
			'Status: Inactive</button>');
		$el.children().last().addClass('inactive');
	}
}

function submitEmployee() {

	event.preventDefault();
	var values = {};

	$.each($('#employeeForm').serializeArray(), function(i, field) {
		values[field.name] = field.value;
	});

	$('#employeeForm').find('input[type=text]').val('');
	$('#employeeForm').find('input[type=number]').val(0);

	$.ajax({
		type: 'POST',
		url: '/employee',
		data: values,
		success: function(data) {
			appendDom(data);
		}
	});
	updateTotal();
}

function loadEmployees() {

	$.ajax({
		type: 'GET',
		url: '/employees',
		success: function(data) {
			console.log(data);
			console.log("Data length is: " + data.length);
			for (var i = 0; i < data.length; i++) {
				appendDom(data[i]);
			}
		}
	});
}

function deactivateEmployee($employee) {

	$employee.removeClass('active');
	$employee.addClass('inactive');
	$employee.text('Status: Inactive');

	var idToDeactivate = $employee.data('id');
	var employeeToDeactivate = {employee_id: idToDeactivate};

	$.ajax({
		type: 'POST',
		url: '/deactivate',
		data: employeeToDeactivate,
		success: function(data) {
			console.log('Employee deactivated successfully');
			updateTotal();
		}
	});
}

function activateEmployee($employee) {

	$employee.removeClass('inactive');
	$employee.addClass('active');
	$employee.text('Status: Active');

	var idToActivate = $employee.data('id');
	var employeeToActivate = {employee_id: idToActivate};

	$.ajax({
		type: 'POST',
		url: '/activate',
		data: employeeToActivate,
		success: function(data) {
			console.log('Employee activated successfully');
			updateTotal();
		}
	});
}
function updateTotal() {
	$.ajax({
		type: 'GET',
		url: '/totalactivesalary',
		success: function(data) {
			console.log('Successfully retrieved total salary of active employees');
			// change the total salary displayed on the DOM
			$('#salaryAmount').text('$' + (data[0].total_salary / 12));
		}
	});
}
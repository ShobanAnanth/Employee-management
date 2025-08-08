// API base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Global variable declaration
let employeeDatabase = [];

// API functions
async function fetchEmployees() {
    try {
        const response = await fetch(`${API_BASE_URL}/employees`);
        if (!response.ok) {
            throw new Error('Failed to fetch employees');
        }
        employeeDatabase = await response.json();
        return employeeDatabase;
    } catch (error) {
        console.error('Error fetching employees:', error);
        alert('Failed to load employees from database');
        return [];
    }
}

async function addEmployeeToDatabase(employeeData) {
    try {
        const response = await fetch(`${API_BASE_URL}/employees`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(employeeData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to add employee');
        }
        
        const newEmployee = await response.json();
        employeeDatabase.push(newEmployee);
        return newEmployee;
    } catch (error) {
        console.error('Error adding employee:', error);
        throw error;
    }
}

async function deleteEmployeeFromDatabase(firstName, lastName) {
    try {
        const response = await fetch(`${API_BASE_URL}/employees`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ firstName, lastName })
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                return null; // Employee not found
            }
            throw new Error('Failed to delete employee');
        }
        
        const result = await response.json();
        // Remove from local array
        employeeDatabase = employeeDatabase.filter(emp => 
            !(emp.firstName.toLowerCase() === firstName.toLowerCase() && 
              emp.lastName.toLowerCase() === lastName.toLowerCase())
        );
        return result.employee;
    } catch (error) {
        console.error('Error deleting employee:', error);
        throw error;
    }
}

// UI functions
function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
    
    // If showing employees page, refresh the list
    if (pageId === 'view-employees') {
        displayEmployees();
    }
}

async function displayEmployees() {
    const employeesList = document.getElementById('employees-list');
    
    // Show loading message
    employeesList.innerHTML = '<p style="text-align: center; color: #666; font-size: 1.2rem;">Loading employees...</p>';
    
    try {
        // Fetch fresh data from database
        await fetchEmployees();
        
        if (employeeDatabase.length === 0) {
            employeesList.innerHTML = '<p style="text-align: center; color: #666; font-size: 1.2rem;">No employees found in the database.</p>';
            return;
        }
        
        employeesList.innerHTML = '';
        
        employeeDatabase.forEach(employee => {
            const employeeCard = document.createElement('div');
            employeeCard.className = 'employee-card';
            employeeCard.innerHTML = `
                <h3>${employee.firstName} ${employee.lastName}</h3>
                <p><strong>Date of Birth:</strong> ${employee.dateOfBirth}</p>
                <p><strong>Location:</strong> ${employee.location}</p>
                <p><strong>Department:</strong> ${employee.department}</p>
                <p class="salary"><strong>Salary:</strong> $${employee.salary.toLocaleString()}</p>
            `;
            employeesList.appendChild(employeeCard);
        });
    } catch (error) {
        employeesList.innerHTML = '<p style="text-align: center; color: #e74c3c; font-size: 1.2rem;">Error loading employees. Please try again.</p>';
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Handle Add Employee Form
    document.getElementById('add-employee-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Adding...';
        submitButton.disabled = true;
        
        try {
            const formData = new FormData(e.target);
            const employeeData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                dateOfBirth: formData.get('dateOfBirth'),
                location: formData.get('location'),
                department: formData.get('department'),
                salary: formData.get('salary')
            };
            
            const newEmployee = await addEmployeeToDatabase(employeeData);
            
            // Show success message
            const successMessage = document.getElementById('add-success-message');
            successMessage.textContent = `Employee ${newEmployee.firstName} ${newEmployee.lastName} has been successfully added to the database!`;
            successMessage.style.display = 'block';
            
            // Reset form
            e.target.reset();
            
            // Hide success message after 5 seconds
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);
            
        } catch (error) {
            alert('Failed to add employee. Please try again.');
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });

    // Handle Fire Employee Form
    document.getElementById('fire-employee-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Deleting...';
        submitButton.disabled = true;
        
        try {
            const formData = new FormData(e.target);
            const firstName = formData.get('fireFirstName');
            const lastName = formData.get('fireLastName');
            
            const removedEmployee = await deleteEmployeeFromDatabase(firstName, lastName);
            
            const successMessage = document.getElementById('fire-success-message');
            const errorMessage = document.getElementById('fire-error-message');
            
            // Hide both messages first
            successMessage.style.display = 'none';
            errorMessage.style.display = 'none';
            
            if (removedEmployee) {
                successMessage.textContent = `Employee ${removedEmployee.firstName} ${removedEmployee.lastName} has been successfully removed from the database.`;
                successMessage.style.display = 'block';
                
                // Reset form
                e.target.reset();
                
                // Hide success message after 5 seconds
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 5000);
            } else {
                errorMessage.textContent = `Employee "${firstName} ${lastName}" not found in the database. Please check the name and try again.`;
                errorMessage.style.display = 'block';
                
                // Hide error message after 5 seconds
                setTimeout(() => {
                    errorMessage.style.display = 'none';
                }, 5000);
            }
        } catch (error) {
            const errorMessage = document.getElementById('fire-error-message');
            errorMessage.textContent = 'Failed to delete employee. Please try again.';
            errorMessage.style.display = 'block';
            
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 5000);
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });

    // Initialize the page by loading employees
    fetchEmployees();
});
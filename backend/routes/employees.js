const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes require authentication
router.use(authenticateToken);

// Get next available employee ID
router.get('/next-id', employeeController.getNextEmployeeId);

// Export employees
router.get('/export', checkPermission('employees.export'), employeeController.exportEmployees);

// Bulk import
router.post(
  '/bulk-import',
  checkPermission('employees.create'),
  employeeController.bulkImport
);

// Get all employees
router.get('/', checkPermission('employees.view'), employeeController.getEmployees);

// Create employee
router.post(
  '/',
  checkPermission('employees.create'),
  upload.fields([{ name: 'photo', maxCount: 1 }]),
  employeeController.createEmployee
);

// Get single employee
router.get('/:id', checkPermission('employees.view'), employeeController.getEmployee);

// Update employee
router.put(
  '/:id',
  checkPermission('employees.edit'),
  upload.fields([{ name: 'photo', maxCount: 1 }]),
  employeeController.updateEmployee
);

// Delete employee
router.delete('/:id', checkPermission('employees.delete'), employeeController.deleteEmployee);

// Provision email
router.post(
  '/:id/provision-email',
  checkPermission('employees.edit'),
  employeeController.provisionEmail
);

// Generate badge
router.get('/:id/badge', checkPermission('employees.view'), employeeController.generateBadge);

// Reset password
router.post(
  '/:id/reset-password',
  checkPermission('employees.edit'),
  employeeController.resetPassword
);

module.exports = router;

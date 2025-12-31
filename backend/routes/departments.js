const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { authenticateToken, checkPermission } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get department hierarchy
router.get('/hierarchy', departmentController.getDepartmentHierarchy);

// Get department statistics
router.get('/stats', departmentController.getStats);

// Get all departments
router.get('/', departmentController.getDepartments);

// Create department
router.post(
  '/',
  checkPermission('departments.create'),
  departmentController.createDepartment
);

// Get single department
router.get('/:id', departmentController.getDepartment);

// Update department
router.put(
  '/:id',
  checkPermission('departments.edit'),
  departmentController.updateDepartment
);

// Delete department
router.delete(
  '/:id',
  checkPermission('departments.delete'),
  departmentController.deleteDepartment
);

// Get department employees
router.get('/:id/employees', departmentController.getDepartmentEmployees);

module.exports = router;

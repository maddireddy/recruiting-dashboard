const Department = require('../models/Department');
const Employee = require('../models/Employee');

/**
 * Get all departments
 * GET /api/v1/departments
 */
exports.getDepartments = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { includeInactive = false } = req.query;

    const query = { organizationId };
    if (!includeInactive) {
      query.status = 'active';
    }

    const departments = await Department.find(query)
      .populate('head', 'personalInfo.firstName personalInfo.lastName employeeId')
      .populate('parent', 'name code')
      .sort({ name: 1 });

    // Get employee count for each department
    const departmentsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        const employeeCount = await Employee.countDocuments({
          'employment.department': dept._id,
          organizationId,
        });

        return {
          ...dept.toObject(),
          employeeCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        departments: departmentsWithCounts,
      },
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get departments',
      error: error.message,
    });
  }
};

/**
 * Get department hierarchy
 * GET /api/v1/departments/hierarchy
 */
exports.getDepartmentHierarchy = async (req, res) => {
  try {
    const { organizationId } = req.user;

    const hierarchy = await Department.getHierarchy(organizationId);

    res.status(200).json({
      success: true,
      data: {
        hierarchy,
      },
    });
  } catch (error) {
    console.error('Get department hierarchy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get department hierarchy',
      error: error.message,
    });
  }
};

/**
 * Get single department
 * GET /api/v1/departments/:id
 */
exports.getDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    const department = await Department.findOne({
      _id: id,
      organizationId,
    })
      .populate('head', 'personalInfo.firstName personalInfo.lastName employeeId')
      .populate('parent', 'name code');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    // Get employee count
    const employeeCount = await Employee.countDocuments({
      'employment.department': department._id,
      organizationId,
    });

    // Get sub-departments
    const subDepartments = await department.getSubDepartments();

    res.status(200).json({
      success: true,
      data: {
        department: {
          ...department.toObject(),
          employeeCount,
          subDepartments,
        },
      },
    });
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get department',
      error: error.message,
    });
  }
};

/**
 * Create department
 * POST /api/v1/departments
 */
exports.createDepartment = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { name, code, description, parent, head, costCenter } = req.body;

    // Check if department with same name already exists
    const existing = await Department.findOne({
      organizationId,
      name: name.trim(),
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists',
      });
    }

    // Create department
    const department = new Department({
      name: name.trim(),
      code: code ? code.trim().toUpperCase() : undefined,
      description,
      parent: parent || undefined,
      head: head || undefined,
      costCenter,
      organizationId,
      status: 'active',
    });

    await department.save();

    await department.populate('head', 'personalInfo.firstName personalInfo.lastName employeeId');
    await department.populate('parent', 'name code');

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: {
        department,
      },
    });
  } catch (error) {
    console.error('Create department error:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create department',
      error: error.message,
    });
  }
};

/**
 * Update department
 * PUT /api/v1/departments/:id
 */
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;
    const { name, code, description, parent, head, costCenter, status } = req.body;

    const department = await Department.findOne({
      _id: id,
      organizationId,
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    // Prevent setting department as its own parent
    if (parent && parent === id) {
      return res.status(400).json({
        success: false,
        message: 'Department cannot be its own parent',
      });
    }

    // Prevent circular parent relationships
    if (parent) {
      const parentDept = await Department.findById(parent);
      if (parentDept && parentDept.parent && parentDept.parent.toString() === id) {
        return res.status(400).json({
          success: false,
          message: 'Circular parent relationship not allowed',
        });
      }
    }

    // Update fields
    if (name) department.name = name.trim();
    if (code) department.code = code.trim().toUpperCase();
    if (description !== undefined) department.description = description;
    if (parent !== undefined) department.parent = parent || null;
    if (head !== undefined) department.head = head || null;
    if (costCenter !== undefined) department.costCenter = costCenter;
    if (status) department.status = status;

    await department.save();

    await department.populate('head', 'personalInfo.firstName personalInfo.lastName employeeId');
    await department.populate('parent', 'name code');

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: {
        department,
      },
    });
  } catch (error) {
    console.error('Update department error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update department',
      error: error.message,
    });
  }
};

/**
 * Delete department
 * DELETE /api/v1/departments/:id
 */
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    const department = await Department.findOne({
      _id: id,
      organizationId,
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    // Check if department has employees
    const employeeCount = await Employee.countDocuments({
      'employment.department': department._id,
      organizationId,
    });

    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department with ${employeeCount} employees. Please reassign them first.`,
      });
    }

    // Check if department has sub-departments
    const subDepartments = await Department.countDocuments({
      parent: department._id,
      organizationId,
    });

    if (subDepartments > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department with ${subDepartments} sub-departments. Please reassign them first.`,
      });
    }

    // Soft delete - mark as inactive
    department.status = 'inactive';
    await department.save();

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete department',
      error: error.message,
    });
  }
};

/**
 * Get department employees
 * GET /api/v1/departments/:id/employees
 */
exports.getDepartmentEmployees = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    const department = await Department.findOne({
      _id: id,
      organizationId,
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    const employees = await Employee.find({
      'employment.department': department._id,
      organizationId,
    }).select('employeeId personalInfo employment access');

    res.status(200).json({
      success: true,
      data: {
        employees,
      },
    });
  } catch (error) {
    console.error('Get department employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get department employees',
      error: error.message,
    });
  }
};

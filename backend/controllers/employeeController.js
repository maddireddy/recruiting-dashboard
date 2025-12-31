const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Organization = require('../models/Organization');
const emailService = require('../services/emailService');
const badgeService = require('../services/badgeService');
const fileUploadService = require('../services/fileUploadService');

/**
 * Get all employees
 * GET /api/v1/employees
 */
exports.getEmployees = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const {
      search,
      department,
      status,
      role,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    // Build query
    const query = { organizationId };

    if (search) {
      query.$text = { $search: search };
    }

    if (department) {
      query['employment.department'] = department;
    }

    if (status) {
      query['employment.status'] = status;
    }

    if (role) {
      query['access.role'] = role;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const employees = await Employee.find(query)
      .populate('employment.department', 'name code')
      .populate('employment.reportingTo', 'personalInfo.firstName personalInfo.lastName employeeId')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-emailAccount.password');

    // Get total count
    const total = await Employee.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        employees,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get employees',
      error: error.message,
    });
  }
};

/**
 * Get single employee
 * GET /api/v1/employees/:id
 */
exports.getEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    const employee = await Employee.findOne({
      _id: id,
      organizationId,
    })
      .populate('employment.department', 'name code')
      .populate('employment.reportingTo', 'personalInfo.firstName personalInfo.lastName employeeId')
      .select('-emailAccount.password');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { employee },
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get employee',
      error: error.message,
    });
  }
};

/**
 * Create employee
 * POST /api/v1/employees
 */
exports.createEmployee = async (req, res) => {
  try {
    const { organizationId, userId } = req.user;
    const {
      firstName,
      lastName,
      email,
      title,
      department,
      role,
      status,
      joinDate,
      provisionEmail,
      emailFormat,
      autoGenerateId,
      employeeId,
    } = req.body;

    // Check if organization is within limits
    const organization = await Organization.findById(organizationId);
    if (!organization.isWithinLimit('users')) {
      return res.status(403).json({
        success: false,
        message: 'User limit reached for your subscription plan',
      });
    }

    // Create employee object
    const employeeData = {
      personalInfo: {
        firstName,
        lastName,
        email,
      },
      employment: {
        title,
        department,
        joinDate: joinDate || new Date(),
        status: status || 'active',
      },
      access: {
        role: role || 'RECRUITER',
      },
      organizationId,
      createdBy: userId,
    };

    // Handle employee ID
    if (!autoGenerateId && employeeId) {
      employeeData.employeeId = employeeId;
    }
    // If autoGenerateId, the pre-save hook will handle it

    // Handle photo upload
    if (req.files && req.files.photo) {
      const photoUpload = await fileUploadService.uploadFile(
        req.files.photo[0],
        'employee-photos'
      );
      employeeData.personalInfo.photo = {
        url: photoUpload.url,
        filename: photoUpload.filename,
        size: photoUpload.size,
        uploadedAt: new Date(),
      };
    }

    // Create employee
    const employee = new Employee(employeeData);
    await employee.save();

    // Provision email if requested
    if (provisionEmail) {
      const provisionedEmail = employee.generateEmployeeEmail(
        emailFormat || 'firstname.lastname',
        organization.emailDomain
      );

      // Provision email account via email service
      const provisionResult = await emailService.provisionEmailAccount({
        email: provisionedEmail,
        firstName,
        lastName,
        organizationId,
        smtpProvider: organization.email.smtpProvider,
        smtpConfig: organization.email.smtpConfig,
      });

      if (provisionResult.success) {
        await employee.markEmailAsProvisioned(provisionedEmail);
        employee.emailAccount.emailFormat = emailFormat;
      }
    }

    // Increment organization user count
    await organization.incrementUsage('users');

    // Populate response
    await employee.populate('employment.department', 'name code');

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: {
        employee,
        emailProvisioned: provisionEmail && employee.emailAccount.provisioned,
      },
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create employee',
      error: error.message,
    });
  }
};

/**
 * Update employee
 * PUT /api/v1/employees/:id
 */
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId, userId } = req.user;
    const {
      firstName,
      lastName,
      email,
      title,
      department,
      role,
      status,
      phone,
      address,
    } = req.body;

    const employee = await Employee.findOne({
      _id: id,
      organizationId,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Update personal info
    if (firstName) employee.personalInfo.firstName = firstName;
    if (lastName) employee.personalInfo.lastName = lastName;
    if (email) employee.personalInfo.email = email;
    if (phone) employee.personalInfo.phone = phone;
    if (address) employee.personalInfo.address = address;

    // Update employment info
    if (title) employee.employment.title = title;
    if (department) employee.employment.department = department;
    if (status) employee.employment.status = status;

    // Update access
    if (role) employee.access.role = role;

    // Handle photo upload
    if (req.files && req.files.photo) {
      const photoUpload = await fileUploadService.uploadFile(
        req.files.photo[0],
        'employee-photos'
      );
      employee.personalInfo.photo = {
        url: photoUpload.url,
        filename: photoUpload.filename,
        size: photoUpload.size,
        uploadedAt: new Date(),
      };
    }

    employee.updatedBy = userId;
    await employee.save();

    await employee.populate('employment.department', 'name code');

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: { employee },
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update employee',
      error: error.message,
    });
  }
};

/**
 * Delete employee
 * DELETE /api/v1/employees/:id
 */
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    const employee = await Employee.findOne({
      _id: id,
      organizationId,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Soft delete - mark as terminated
    employee.employment.status = 'terminated';
    employee.employment.terminationDate = new Date();
    await employee.save();

    // Decrement organization user count
    const organization = await Organization.findById(organizationId);
    await organization.decrementUsage('users');

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete employee',
      error: error.message,
    });
  }
};

/**
 * Provision email for employee
 * POST /api/v1/employees/:id/provision-email
 */
exports.provisionEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;
    const { emailFormat } = req.body;

    const employee = await Employee.findOne({
      _id: id,
      organizationId,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    if (employee.emailAccount.provisioned) {
      return res.status(400).json({
        success: false,
        message: 'Email already provisioned for this employee',
      });
    }

    const organization = await Organization.findById(organizationId);

    const provisionedEmail = employee.generateEmployeeEmail(
      emailFormat || 'firstname.lastname',
      organization.emailDomain
    );

    // Provision email account
    const provisionResult = await emailService.provisionEmailAccount({
      email: provisionedEmail,
      firstName: employee.personalInfo.firstName,
      lastName: employee.personalInfo.lastName,
      organizationId,
      smtpProvider: organization.email.smtpProvider,
      smtpConfig: organization.email.smtpConfig,
    });

    if (!provisionResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to provision email',
        error: provisionResult.error,
      });
    }

    await employee.markEmailAsProvisioned(provisionedEmail);
    employee.emailAccount.emailFormat = emailFormat;

    res.status(200).json({
      success: true,
      message: 'Email provisioned successfully',
      data: {
        email: provisionedEmail,
        credentials: provisionResult.credentials,
      },
    });
  } catch (error) {
    console.error('Provision email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to provision email',
      error: error.message,
    });
  }
};

/**
 * Generate employee badge
 * GET /api/v1/employees/:id/badge
 */
exports.generateBadge = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;
    const { format = 'pdf', template = 'standard' } = req.query;

    const employee = await Employee.findOne({
      _id: id,
      organizationId,
    }).populate('employment.department', 'name');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const organization = await Organization.findById(organizationId);

    // Generate badge
    const badgeData = {
      employeeId: employee.employeeId,
      fullName: employee.fullName,
      title: employee.employment.title,
      department: employee.employment.departmentName,
      photo: employee.personalInfo.photo?.url,
      companyLogo: organization.branding.logo?.url,
      companyName: organization.name,
      colors: organization.branding.colors,
    };

    const badgeResult = await badgeService.generateBadge(
      badgeData,
      format,
      template
    );

    if (!badgeResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate badge',
        error: badgeResult.error,
      });
    }

    // Update employee badge info
    if (!employee.badge.generated) {
      await employee.markBadgeAsGenerated({
        pdf: badgeResult.pdfUrl,
        png: badgeResult.pngUrl,
        qrCode: badgeResult.qrCodeUrl,
      });
    }

    // Return badge file
    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="badge-${employee.employeeId}.pdf"`
      );
    } else {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="badge-${employee.employeeId}.png"`
      );
    }

    res.send(badgeResult.buffer);
  } catch (error) {
    console.error('Generate badge error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate badge',
      error: error.message,
    });
  }
};

/**
 * Reset employee password
 * POST /api/v1/employees/:id/reset-password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    const employee = await Employee.findOne({
      _id: id,
      organizationId,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    if (!employee.emailAccount.provisioned) {
      return res.status(400).json({
        success: false,
        message: 'No email account provisioned for this employee',
      });
    }

    const organization = await Organization.findById(organizationId);

    // Generate temporary password
    const tempPassword = emailService.generateTemporaryPassword();

    // Reset password via email service
    const resetResult = await emailService.resetEmployeePassword({
      email: employee.emailAccount.email,
      tempPassword,
      smtpProvider: organization.email.smtpProvider,
      smtpConfig: organization.email.smtpConfig,
    });

    if (!resetResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to reset password',
        error: resetResult.error,
      });
    }

    employee.emailAccount.lastPasswordReset = new Date();
    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      data: {
        tempPassword, // In production, send this via email only
      },
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message,
    });
  }
};

/**
 * Get next available employee ID
 * GET /api/v1/employees/next-id
 */
exports.getNextEmployeeId = async (req, res) => {
  try {
    const { organizationId } = req.user;

    const nextId = await Employee.getNextEmployeeId(organizationId);

    res.status(200).json({
      success: true,
      data: {
        nextEmployeeId: nextId,
      },
    });
  } catch (error) {
    console.error('Get next employee ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get next employee ID',
      error: error.message,
    });
  }
};

/**
 * Bulk import employees
 * POST /api/v1/employees/bulk-import
 */
exports.bulkImport = async (req, res) => {
  try {
    const { organizationId, userId } = req.user;
    const { employees } = req.body; // Array of employee data

    if (!Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No employees provided for import',
      });
    }

    const organization = await Organization.findById(organizationId);

    const results = {
      success: [],
      failed: [],
    };

    for (const empData of employees) {
      try {
        const employee = new Employee({
          personalInfo: {
            firstName: empData.firstName,
            lastName: empData.lastName,
            email: empData.email,
            phone: empData.phone,
          },
          employment: {
            title: empData.title,
            department: empData.department,
            joinDate: empData.joinDate || new Date(),
            status: empData.status || 'active',
          },
          access: {
            role: empData.role || 'RECRUITER',
          },
          organizationId,
          createdBy: userId,
        });

        if (empData.employeeId) {
          employee.employeeId = empData.employeeId;
        }

        await employee.save();
        await organization.incrementUsage('users');

        results.success.push({
          employeeId: employee.employeeId,
          name: employee.fullName,
        });
      } catch (error) {
        results.failed.push({
          data: empData,
          error: error.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Imported ${results.success.length} employees successfully`,
      data: results,
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import employees',
      error: error.message,
    });
  }
};

/**
 * Export employees
 * GET /api/v1/employees/export
 */
exports.exportEmployees = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { format = 'csv' } = req.query;

    const employees = await Employee.find({ organizationId })
      .populate('employment.department', 'name')
      .select('-emailAccount.password');

    if (format === 'csv') {
      // Convert to CSV
      const csv = employees
        .map((emp) => {
          return [
            emp.employeeId,
            emp.personalInfo.firstName,
            emp.personalInfo.lastName,
            emp.personalInfo.email,
            emp.employment.title,
            emp.employment.departmentName,
            emp.access.role,
            emp.employment.status,
            emp.employment.joinDate,
          ].join(',');
        })
        .join('\n');

      const header =
        'Employee ID,First Name,Last Name,Email,Title,Department,Role,Status,Join Date\n';

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="employees.csv"'
      );
      res.send(header + csv);
    } else {
      res.status(200).json({
        success: true,
        data: { employees },
      });
    }
  } catch (error) {
    console.error('Export employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export employees',
      error: error.message,
    });
  }
};

/**
 * Get employee statistics
 * GET /api/v1/employees/stats
 */
exports.getStats = async (req, res) => {
  try {
    const { organizationId } = req.user;

    const [total, active, inactive, onLeave, byDepartment, byRole] = await Promise.all([
      Employee.countDocuments({ organizationId }),
      Employee.countDocuments({ organizationId, 'employment.status': 'active' }),
      Employee.countDocuments({ organizationId, 'employment.status': 'inactive' }),
      Employee.countDocuments({ organizationId, 'employment.status': 'on-leave' }),

      // Group by department
      Employee.aggregate([
        { $match: { organizationId } },
        {
          $lookup: {
            from: 'departments',
            localField: 'employment.department',
            foreignField: '_id',
            as: 'deptInfo',
          },
        },
        { $unwind: { path: '$deptInfo', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$deptInfo.name',
            count: { $sum: 1 },
          },
        },
        { $match: { _id: { $ne: null } } },
        { $sort: { count: -1 } },
      ]),

      // Group by role
      Employee.aggregate([
        { $match: { organizationId } },
        {
          $group: {
            _id: '$access.role',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        active,
        inactive,
        onLeave,
        byDepartment: byDepartment.map((d) => ({ department: d._id, count: d.count })),
        byRole: byRole.map((r) => ({ role: r._id, count: r.count })),
      },
    });
  } catch (error) {
    console.error('Get employee stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get employee statistics',
      error: error.message,
    });
  }
};

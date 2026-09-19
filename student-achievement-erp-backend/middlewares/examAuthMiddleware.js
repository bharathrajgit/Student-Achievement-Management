// middlewares/examAuthMiddleware.js

/**
 * Middleware: Check if user can manage exams
 * Allowed roles: coordinator, sub-coordinator, superadmin
 */
export const canManageExams = (req, res, next) => {
  const userRole = req.user?.role;
  const allowedRoles = ['sub-coordinator', 'coordinator', 'superadmin'];

  if (!userRole || !allowedRoles.includes(userRole)) {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Only coordinators can manage exams.',
    });
  }

  next();
};

/**
 * Middleware: Check if user is a student
 */
export const canRegisterForExam = (req, res, next) => {
  const userRole = req.user?.role;

  if (userRole !== 'student') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Only students can register for exams.',
    });
  }

  next();
};

/**
 * Middleware: Check if user can verify exams
 */
export const canVerifyExams = (req, res, next) => {
  const userRole = req.user?.role;
  const allowedRoles = ['sub-coordinator', 'coordinator', 'superadmin'];

  if (!userRole || !allowedRoles.includes(userRole)) {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Only coordinators can verify exams.',
    });
  }

  next();
};

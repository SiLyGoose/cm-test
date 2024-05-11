'use strict';

module.exports = function(Course) {
  Course.beforeRemote('create', function(context, user, next) {
    context.args.data.date = Date.now();
    next();
  });

  Course.getAccountsFromActiveCourses = function(cb) {
    var AccountCourse = Course.app.models.AccountCourse;
    var Account = Course.app.models.Account;
    // find all active courses and return a list of courseId
    Course.find({where: {status: 'Active'}}, function(err, activeCourses) {
      if (err) return cb(err);
      var courseIds = activeCourses.map(function(course) {
        return course.id;
      });
      // find all account course associations where courseId
      // is in activeCourseId list
      AccountCourse.find({where: {courseId: {inq: courseIds}}},
        function(err, accountCourses) {
          var accountIds = accountCourses.map(function(accountCourse) {
            return accountCourse.accountId;
          });

          Account.find({where: {id: {inq: accountIds}}}, cb);
        });
    });
  };

  Course.remoteMethod(
    'getAccountsFromActiveCourses',
    {
      http: {
        path: '/getAccountsFromActiveCourses',
        verb: 'get',
      },
      returns: {
        arg: 'accounts',
        type: 'array',
      },
    }
  );

  Course.getActiveCoursesByOrganization = function(organizationId, cb) {
    Course.find({
      where: {
        and: [
          {organizationId: organizationId},
          {status: 'Active'},
        ],
      },
    }, cb);
  };

  Course.remoteMethod(
    'getActiveCoursesByOrganization',
    {
      http: {
        path: '/getActiveCoursesByOrganization',
        verb: 'get',
      },
      accepts: {
        arg: 'organizationId',
        type: 'string',
        required: true,
      },
      returns: {
        arg: 'courses',
        type: 'array',
      },
    }
  );

  Course.addCourse = function(courseData, cb) {
    Course.create(courseData, function(err, newCourse) {
      if (err) return cb(err);
      cb(null, newCourse);
    });
  };

  Course.remoteMethod(
    'addCourse',
    {
      http: {
        path: '/addCourse',
        verb: 'post',
      },
      accepts: {
        arg: 'courseData',
        type: 'object',
        http: {
          source: 'body',
        },
        required: true,
      },
      returns: {
        arg: 'course',
        type: 'object',
      },
    }
  );

  Course.changeClassroom = function(courseId, newClassroomId, cb) {
    Course.findById(courseId, function(err, course) {
      if (err) return cb(err);
      if (!course) return cb(new Error('Course not found'));

      course.updateAttributes({classroomId: newClassroomId},
        function(err, updatedCourse) {
          if (err) return cb(err);
          cb(null, updatedCourse);
        }
      );
    });
  };

  Course.remoteMethod(
    'changeClassroom',
    {
      http: {
        path: '/changeClassroom',
        verb: 'post',
      },
      accepts: [
        {
          arg: 'courseId',
          type: 'string',
          required: true,
        },
        {
          arg: 'newClassroomId',
          type: 'string',
          required: true,
        },
      ],
      returns: {
        arg: 'updatedCourse',
        type: 'object',
      },
    }
  );

  Course.changeDate = function(courseId, newDate, cb) {
    Course.findById(courseId, function(err, course) {
      if (err) return cb(err);
      if (!course) return cb(new Error('Course not found'));

      course.updateAttributes({date: newDate}, function(err, updatedCourse) {
        if (err) return cb(err);
        cb(null, updatedCourse);
      });
    });
  };

  Course.remoteMethod(
    'changeDate',
    {
      http: {
        path: '/changeDate',
        verb: 'post',
      },
      accepts: [
        {
          arg: 'courseId',
          type: 'string',
          required: true,
        },
        {
          arg: 'newDate',
          type: 'date',
          required: true,
        },
      ],
      returns: {
        arg: 'updatedCourse',
        type: 'object',
      },
    }
  );

  Course.deleteCourse = function(courseId, cb) {
    var AccountCourse = Course.app.models.AccountCourse;

    Course.destroyById(courseId, function(err) {
      if (err) return cb(err);

      AccountCourse.destroyAll({courseId: courseId}, function(err) {
        if (err) return cb(err);
        cb(null, {message: 'Course deleted successfully'});
      });
    });
  };

  Course.remoteMethod(
    'deleteCourse',
    {
      http: {
        path: '/deleteCourse',
        verb: 'delete',
      },
      accepts: {
        arg: 'courseId',
        type: 'string',
        required: true,
      },
      returns: {
        arg: 'message',
        type: 'string',
      },
    }
  );
};

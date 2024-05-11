'use strict';

module.exports = function(Account) {
  Account.linkToCourse = function(accountId, courseId, cb) {
    var AccountCourse = Account.app.models.AccountCourse;

    AccountCourse.create({
      accountId: accountId,
      courseId: courseId,
    }, function(err, accountCourse) {
      if (err) return cb(err);
      cb(null, accountCourse);
    });
  };

  Account.remoteMethod(
    'linkToCourse',
    {
      http: {
        path: '/linkToCourse',
        verb: 'post',
      },
      accepts: [
        {
          arg: 'accountId',
          type: 'string',
          required: true,
        },
        {
          arg: 'courseId',
          type: 'string',
          required: true,
        },
      ],
      returns: {
        arg: 'accountCourse',
        type: 'object',
      },
    }
  );
};

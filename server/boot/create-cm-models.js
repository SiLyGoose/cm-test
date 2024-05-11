'use strict';

var async = require('async');
module.exports = function(app) {
  var mongoDs = app.dataSources.mongoDs;

  async.parallel({
    // create organizations first because organization
    // does not belong to any model
    organizations: async.apply(createOrganizations),
  }, function(err, results) {
    if (err) throw err;

    createClassrooms(results.organizations, function(err, classrooms) {
      console.log('> classroom model created successfully');

      createCourses(results.organizations, classrooms, function(err, courses) {
        console.log('> course model created successfully');

        createAccounts(results.organizations, function(err, accounts) {
          console.log('> account model created successfully');

          createAccountCourseAssociations(accounts, courses, function(err) {
            console.log('accountCourseAssociation model created successfully');
          });
        });
      });
    });
  });

  function createAccounts(organizations, cb) {
    mongoDs.automigrate('Account', function(err) {
      if (err) return cb(err);
      var Account = app.models.Account;
      Account.create([{
        name: 'account1',
        email: 'account@1.com',
        organizationId: organizations[0].id,
      }, {
        name: 'account2',
        email: 'account@2.com',
        organizationId: organizations[1].id,
      }, {
        name: 'account3',
        email: 'account@3.com',
        organizationId: organizations[1].id,
      }], cb);
    });
  }

  function createCourses(organizations, classrooms, cb) {
    mongoDs.automigrate('Course', function(err) {
      if (err) return cb(err);
      var Course = app.models.Course;
      Course.create([{
        name: 'Course 1',
        status: 'Active',
        classroomId: classrooms[0].id,
        organizationId: organizations[0].id,
      }, {
        name: 'Course 2',
        status: 'Active',
        classroomId: classrooms[1].id,
        organizationId: organizations[1].id,
      }, {
        name: 'Course 3',
        status: 'Not Active',
        classroomId: classrooms[2].id,
        organizationId: organizations[1].id,
      }], cb);
    });
  }

  function createClassrooms(organizations, cb) {
    mongoDs.automigrate('Classroom', function(err) {
      if (err) return cb(err);
      var Classroom = app.models.Classroom;
      Classroom.create([{
        name: '142',
        organizationId: organizations[0].id,
      }, {
        name: '143',
        organizationId: organizations[1].id,
      }, {
        name: '144',
        organizationId: organizations[1].id,
      }, {
        name: '145',
        organizationId: organizations[2].id,
      }], cb);
    });
  }

  function createOrganizations(cb) {
    mongoDs.automigrate('Organization', function(err) {
      if (err) return cb(err);
      var Organization = app.models.Organization;
      Organization.create([{
        name: 'Lymon',
      }, {
        name: 'CPP',
      }, {
        name: 'A*',
      }], cb);
    });
  }

  function createAccountCourseAssociations(accounts, courses, cb) {
    mongoDs.automigrate('AccountCourse', function(err) {
      if (err) return cb(err);
      var AccountCourse = app.models.AccountCourse;
      var accountCourseData = [];
      accounts.forEach(function(account) {
        courses.forEach(function(course) {
          if (account.organizationId != course.organizationId) return;
          accountCourseData.push({
            accountId: account.id,
            courseId: course.id,
          });
        });
      });
      AccountCourse.create(accountCourseData, cb);
    });
  }
};

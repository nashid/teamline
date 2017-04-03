// Expects the input to be ordered by team, deliverable and timestamp.


contribs = function(head, req) {
  // settings
  var deadlines = {
    "d1": 1486396800000,
    "d2": 1488211200000,
    "d3": 1489417200000
  };



  provides("json", function() {
    var results = [];
    var prev = null;
    var i = 0;
    var deliverable = {
      "allTestNames": [],
      "everPass": [],
      "maxCoverage": 0,
      "finalGrade": 0,
      "testGrade": 0,
      "coverageGrade": 0
    };


    // Team-specific
    var users = {};
    var deliverables = {};
    var currDeliverable = JSON.parse(JSON.stringify(deliverable)); // deep copy

    while (row = getRow()) {
      var curr = row.value;

      if (i == 0)
        prev = curr;

      if (prev.team !== curr.team) {
        var userKeys = Object.keys(users);
        var totalPassContrib = Object.keys(users).reduce(function(acc, key) {
          return acc + users[key].beforeDeadline.contribution.passCount;
        }, 0);
        var totalCoverContrib = Object.keys(users).reduce(function(acc, key) {
          return acc + users[key].beforeDeadline.contribution.coverage;
        }, 0);

        userKeys.forEach(function(key) {
          var testPct = users[key].beforeDeadline.contribution.passCount*100/totalPassContrib;
          var coverPct = users[key].beforeDeadline.contribution.coverage*100/totalCoverContrib;

          users[key].beforeDeadline.contribution["tests"] = +testPct.toFixed(4);
          users[key].beforeDeadline.contribution["overall"] = +(0.8*testPct + 0.2*coverPct).toFixed(4);
        });

        deliverables[prev.deliverable] = {
          "due": deadlines[prev.deliverable],
          "testNames": currDeliverable.allTestNames,
          "finalGrade": +currDeliverable.finalGrade,
          "testGrade": +currDeliverable.testGrade,
          "coverageGrade": +currDeliverable.coverGrade,
          "users": users
        }

        results.push({
          "team": prev.team,
          "deliverables": deliverables
        });

        users = {};
        currDeliverable = JSON.parse(JSON.stringify(deliverable));
        deliverables = {};
      }

      if (prev.deliverable !== curr.deliverable) {
        var userKeys = Object.keys(users);
        var totalPassContrib = Object.keys(users).reduce(function(acc, key) {
          return acc + users[key].beforeDeadline.contribution.passCount;
        }, 0);
        var totalCoverContrib = Object.keys(users).reduce(function(acc, key) {
          return acc + users[key].beforeDeadline.contribution.coverage;
        }, 0);

        userKeys.forEach(function(key) {
          var testPct = users[key].beforeDeadline.contribution.passCount*100/totalPassContrib;
          var coverPct = users[key].beforeDeadline.contribution.coverage*100/totalCoverContrib;

          users[key].beforeDeadline.contribution["tests"] = +testPct.toFixed(4);
          users[key].beforeDeadline.contribution["overall"] = +(0.8*testPct + 0.2*coverPct).toFixed(4);
        });

        deliverables[prev.deliverable] = {
          "due": deadlines[prev.deliverable],
          "testNames": currDeliverable.allTestNames,
          "finalGrade": +currDeliverable.finalGrade,
          "testGrade": +currDeliverable.testGrade,
          "coverageGrade": +currDeliverable.coverGrade,
          "users": users
        }
        users = {};
        currDeliverable = JSON.parse(JSON.stringify(deliverable));
      }


      // Some test names might not show up until later commits because tests can added during the deliverable. Sigh.
      // It is important that we *NOT* sort the names since it will throw off the index of earlier commits.
      var testNames = curr.passNames.concat(curr.skipNames).concat(curr.failNames);
      testNames.forEach(function(name) {
        if (currDeliverable.allTestNames.indexOf(name) < 0)
          currDeliverable.allTestNames.push(name);
      });



      var newPassTests = curr.passNames.filter(function(name) {
        // test is new if it is not in everPass
        return currDeliverable.everPass.indexOf(name) < 0;
      });
      var passContribCount = newPassTests.length;
      var coverContribution = Math.max(0,curr.coverGrade-currDeliverable.maxCoverage);
      // NOT correct - not actual grade
      // var contrib = 0.8*passContribution + 0.2*coverContribution;

      currDeliverable.everPass = currDeliverable.everPass.concat(newPassTests);
      currDeliverable.maxCoverage = Math.max(curr.coverGrade,currDeliverable.maxCoverage);

      commit = {
        "commitSha": curr.commitSha,
        "timestamp": curr.timestamp,
        "grade": curr.finalGrade,
        "coverage": curr.coverGrade,
        "coverageContrib": coverContribution,
        "passCount": curr.passCount,
        "passCountNew": passContribCount,
        "skipCount": curr.skipCount,
        "failCount": curr.failCount,
        "passTests": curr.passNames.map(function(testName) {
          return currDeliverable.allTestNames.indexOf(testName);
        }),
        "skipTests": curr.skipNames.map(function(testName) {
          return currDeliverable.allTestNames.indexOf(testName);
        }),
        "failTests": curr.failNames.map(function(testName) {
          return currDeliverable.allTestNames.indexOf(testName);
        })
      }


      if (!users[curr.user]) {
        users[curr.user] = {
          "beforeDeadline": {
            "contribution":{
              "coverage": 0,
              "passCount": 0
            },
            "commits": []
          },
          "afterDeadline": {
            "contribution":{
              "coverage": 0,
              "passCount": 0
            },
            "commits": []
          }
        };
      }
      if (curr.timestamp <= deadlines[curr.deliverable]) {
        users[curr.user].beforeDeadline.contribution.passCount += passContribCount;
        users[curr.user].beforeDeadline.contribution.coverage += coverContribution;
        users[curr.user].beforeDeadline.commits.push(commit);

        currDeliverable.finalGrade = curr.finalGrade;
        currDeliverable.testGrade = curr.testGrade;
        currDeliverable.coverGrade = curr.coverGrade;
      }
      else {
        users[curr.user].afterDeadline.contribution.passCount += passContribCount;
        users[curr.user].afterDeadline.contribution.coverage += coverContribution;
        users[curr.user].afterDeadline.commits.push(commit);
      }


      prev = curr;
      i++;
    }
    results.push({
      "team": prev.team,
      "deliverables": deliverables
    });
    return JSON.stringify(results);
  });
}

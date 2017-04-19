// Expects the input to be ordered by team, deliverable and timestamp.


contribs = function(head, req) {
  // settings
  var dates = {
    "release": {
      "d1": 1484755200000,
      "d2": 1487001600000,
      "d3": 1488643200000
    },
    "due": {
      "d1": 1486396800000,
      "d2": 1488211200000,
      "d3": 1489417200000
    }
  }


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

      if (prev.deliverable !== curr.deliverable || prev.team !== curr.team) {
        deliverables[prev.deliverable] = {
          "released": dates.release[prev.deliverable],
					"due": dates.due[prev.deliverable],
					"testNames": currDeliverable.allTestNames,
					"finalGrade": currDeliverable.finalGrade,
					"testGrade": currDeliverable.testGrade,
					"coverageGrade": currDeliverable.coverGrade,
					"users": aggregateDeliverable(users)
				};
        users = {};
        currDeliverable = JSON.parse(JSON.stringify(deliverable));
        if (prev.team !== curr.team) {
          results.push({
            "team": prev.team,
            "deliverables": deliverables
          });
          deliverables = {};
        }
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
        "coverageContrib": coverContribution.toFixed(4),
        "passCount": curr.passCount,
        "passCountNew": passContribCount,
				"passPctNew": 0,
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
      if (curr.timestamp <= dates.due[curr.deliverable]) {
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

    // handle the very last row we get (close the deliverable and the team)
    deliverables[prev.deliverable] = {
      "released": dates.release[prev.deliverable],
      "due": dates.due[prev.deliverable],
      "testNames": currDeliverable.allTestNames,
      "finalGrade": currDeliverable.finalGrade,
      "testGrade": currDeliverable.testGrade,
      "coverageGrade": currDeliverable.coverGrade,
      "users": aggregateDeliverable(users)
    };
    results.push({
      "team": prev.team,
      "deliverables": deliverables
    });

    return JSON.stringify(results);
  });
}


function aggregateDeliverable(users) {
  var userKeys = Object.keys(users);
 	var contribTypes = ["beforeDeadline", "afterDeadline"];
  var totalContrib = {
    "beforeDeadline": {
      "pass": 0,
      "cover": 0
    },
    "afterDeadline": {
     "pass": 0,
     "cover": 0
    }
  }

  userKeys.forEach(function(key) {
    contribTypes.forEach(function(type) {
      totalContrib[type].pass += users[key][type].contribution.passCount;
      totalContrib[type].cover += users[key][type].contribution.coverage;
    });
  });

  userKeys.forEach(function(key) {
    contribTypes.forEach(function(type) {
      var testPct = 0;
      var coverPct = 0;
      var coverageContribIncrease = 0;
      if (totalContrib[type].pass > 0)
        testPct = users[key][type].contribution.passCount*100/totalContrib[type].pass;
      if (totalContrib[type].cover > 0)
        coverPct = users[key][type].contribution.coverage*100/totalContrib[type].cover;

      users[key][type].contribution.coverage = users[key][type].contribution.coverage.toFixed(4);
      users[key][type].contribution["tests"] = testPct.toFixed(4);
      users[key][type].contribution["overall"] = (0.8*testPct + 0.2*coverPct).toFixed(4);

      users[key][type].commits.forEach(function(commit) {
        if (totalContrib[type].pass > 0)
          commit.passPctNew = (commit.passCountNew*100/totalContrib[type].pass).toFixed(4);

        if (+commit.coverageContrib > 0)
          coverageContribIncrease += +commit.coverageContrib;
        commit["coverageContribAcc"] = coverageContribIncrease.toFixed(4);
      });
    });
  });
  return users;
}

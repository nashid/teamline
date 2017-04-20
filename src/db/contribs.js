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

  var skipTeams = ["ataraxie", "fabiantam", "team000"];


  provides("json", function() {
    var results = {};
    var prev = null;
    var i = 0;
    var deliverable = {
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
        var userObj = aggregateDeliverable(users);
        var userNames = Object.keys(userObj);
        var contribs = [];
        userNames.forEach(function(user) {
          contribs.push(+userObj[user].contribution.overall/100);
        });
        contribDist = contributionUniformityScore(contribs);

        deliverables[prev.deliverable] = {
					"finalGrade": currDeliverable.finalGrade,
					"testGrade": currDeliverable.testGrade,
					"coverageGrade": currDeliverable.coverGrade,
          "contribDist": contribDist.toFixed(4),
					"users": userObj
				};
        users = {};
        currDeliverable = JSON.parse(JSON.stringify(deliverable));
        if (prev.team !== curr.team) {
          results[prev.team] = deliverables
          deliverables = {};
        }
      }


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
      }


      if (!users[curr.user]) {
        users[curr.user] = {
          "contribution":{
            "coverage": 0,
            "passCount": 0
          },
          "commits": []
        };
      }
      if (curr.timestamp <= dates.due[curr.deliverable]) {
        users[curr.user].contribution.passCount += passContribCount;
        users[curr.user].contribution.coverage += coverContribution;
        users[curr.user].commits.push(commit);

        currDeliverable.finalGrade = curr.finalGrade;
        currDeliverable.testGrade = curr.testGrade;
        currDeliverable.coverGrade = curr.coverGrade;
      }

      prev = curr;
      i++;
    }

    // handle the very last row we get (close the deliverable and the team)
    var userObj = aggregateDeliverable(users);
    var userNames = Object.keys(userObj);
    var contribs = [];
    userNames.forEach(function(user) {
      contribs.push(+userObj[user].contribution.overall/100);
    });
    contribDist = contributionUniformityScore(contribs);

    deliverables[prev.deliverable] = {
      "finalGrade": currDeliverable.finalGrade,
      "testGrade": currDeliverable.testGrade,
      "coverageGrade": currDeliverable.coverGrade,
      "contribDist": contribDist.toFixed(4),
      "users": userObj
    };
    results[prev.team] = deliverables;

    // remove skip teams
    skipTeams.forEach(function(team) {
      delete results[team];
    });

    return JSON.stringify(results);
  });
}

// Uses sum of absolute differences between pairs of contribution amounts (gives linear scale)
// Input: array of overall contributions for each member of the team
// Output: number between 0 and 1 where 1 if all members contributed equally; 0 if one member did all the work;
function contributionUniformityScore(contributions) {
  var m = contributions.length  // number of team members
  var sortedContrib = contributions.sort(function(a, b) { return a-b; });

  var contribDist = 0;
  for (var i = 0; i < m - 1; i++) {
    contribDist += Math.abs(contributions[i] - contributions[i+1])
  }
  return 1-contribDist;  
}


function aggregateDeliverable(users) {
  var userKeys = Object.keys(users);
  var totalContrib = {
    "pass": 0,
    "cover": 0
  }

  userKeys.forEach(function(key) {
    totalContrib.pass += users[key].contribution.passCount;
    totalContrib.cover += users[key].contribution.coverage;
  });

  userKeys.forEach(function(key) {
    var testPct = 0;
    var coverPct = 0;
    var coverageContribIncrease = 0;
    if (totalContrib.pass > 0)
      testPct = users[key].contribution.passCount*100/totalContrib.pass;
    if (totalContrib.cover > 0)
      coverPct = users[key].contribution.coverage*100/totalContrib.cover;

    users[key].contribution.coverage = users[key].contribution.coverage.toFixed(4);
    users[key].contribution["tests"] = testPct.toFixed(4);
    users[key].contribution["overall"] = (0.8*testPct + 0.2*coverPct).toFixed(4);

    users[key].commits.forEach(function(commit) {
      if (totalContrib.pass > 0)
        commit.passPctNew = (commit.passCountNew*100/totalContrib.pass).toFixed(4);

      if (+commit.coverageContrib > 0)
        coverageContribIncrease += +commit.coverageContrib;
      commit["coverageContribAcc"] = coverageContribIncrease.toFixed(4);
    });
  });
  return users;
}

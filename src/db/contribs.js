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

  var deliverablesObj = {
    "d1": {
      "release": 1484755200000,
      "due": 1486396800000
    },
    "d2": {
      "release": 1487001600000,
      "due": 1488211200000
    },
    "d3": {
      "release": 1488643200000,
      "due": 1489417200000
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
          contribs.push(+userObj[user].ctb.overall/100);
        });
        contribDist = contributionUniformityScore(contribs);

        deliverables[prev.deliverable] = {
					"grd": currDeliverable.finalGrade,
					"pGrd": currDeliverable.testGrade,
					"cvgGrd": currDeliverable.coverGrade,
          "ctbDist": contribDist.toFixed(4),
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
      var coverContribution = isNaN(curr.coverGrade) ? 0 : Math.max(0,curr.coverGrade-currDeliverable.maxCoverage);
      // NOT correct - not actual grade
      // var contrib = 0.8*passContribution + 0.2*coverContribution;

      currDeliverable.everPass = currDeliverable.everPass.concat(newPassTests);
      currDeliverable.maxCoverage = isNaN(curr.coverGrade) ? currDeliverable.maxCoverage : Math.max(curr.coverGrade,currDeliverable.maxCoverage);

      commit = {
        "sha": curr.commitSha,
        "time": curr.timestamp,
        "grd": curr.finalGrade,
        "cvg": curr.coverGrade,
        "cvgCtb": coverContribution.toFixed(4),
        "pCnt": curr.passCount,
        "pPct": curr.testGrade,
        "pCntNew": passContribCount,
				"pPctNew": 0,
        "sCnt": curr.skipCount,
        "fCnt": curr.failCount,
      }


      if (!users[curr.user]) {
        users[curr.user] = {
          "ctb":{
            "cvg": 0,
            "pCnt": 0
          },
          "commits": []
        };
      }
      if (curr.timestamp <= dates.due[curr.deliverable]) {
        // skip invalid commits
        if (!isNaN(commit.grd) && !isNaN(commit.cvg)) {
          users[curr.user].ctb.pCnt += passContribCount;
          users[curr.user].ctb.cvg += coverContribution;
          users[curr.user].commits.push(commit);

          currDeliverable.finalGrade = curr.finalGrade;
          currDeliverable.testGrade = curr.testGrade;
          currDeliverable.coverGrade = curr.coverGrade;
        }
      }

      prev = curr;
      i++;
    }

    // handle the very last row we get (close the deliverable and the team)
    var userObj = aggregateDeliverable(users);
    var userNames = Object.keys(userObj);
    var contribs = [];
    userNames.forEach(function(user) {
      contribs.push(+userObj[user].ctb.overall/100);
    });
    contribDist = contributionUniformityScore(contribs);

    deliverables[prev.deliverable] = {
      "grd": currDeliverable.finalGrade,
      "pGrd": currDeliverable.testGrade,
      "cvgGrd": currDeliverable.coverGrade,
      "ctbDist": contribDist.toFixed(4),
      "users": userObj
    };
    results[prev.team] = deliverables;

    // remove skip teams
    skipTeams.forEach(function(team) {
      delete results[team];
    });

    return JSON.stringify({"deliverables": deliverablesObj, "teams": results});
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
  var maxCoverage = 0;
  var userKeys = Object.keys(users);
  var totalContrib = {
    "pass": 0,
    "cover": 0
  }

  userKeys.forEach(function(key) {
    totalContrib.pass += users[key].ctb.pCnt;
    totalContrib.cover += users[key].ctb.cvg;

    users[key].commits.forEach(function(commit) {
      if (+commit.cvg > maxCoverage)
        maxCoverage = +commit.cvg;
    });
  });

  userKeys.forEach(function(key) {
    var testPct = 0;
    var coverPct = 0;
    var passContribIncrease = 0;
    var coverageContribIncrease = 0;
    if (totalContrib.pass > 0)
      testPct = users[key].ctb.pCnt*100/totalContrib.pass;
    if (totalContrib.cover > 0)
      coverPct = users[key].ctb.cvg*100/totalContrib.cover;

    users[key].ctb.cvg = (users[key].ctb.cvg*100/maxCoverage).toFixed(4);
    users[key].ctb["tests"] = testPct.toFixed(4);
    users[key].ctb["overall"] = (0.8*testPct + 0.2*coverPct).toFixed(4);

    users[key].commits.forEach(function(commit) {
      if (totalContrib.pass > 0)
        commit.pPctNew = (commit.pCntNew*100/totalContrib.pass).toFixed(4);
      if (+commit.pPctNew > 0)
        passContribIncrease += +commit.pPctNew;
      commit["pCtbAcc"] = passContribIncrease.toFixed(4);

      if (+commit.cvgCtb > 0)
        coverageContribIncrease += +commit.cvgCtb;
      commit["cvgCtbAcc"] = (coverageContribIncrease*100/maxCoverage).toFixed(4);


    });
  });
  return users;
}

// Expects the input to be ordered by team, deliverable and timestamp.


contribs = function(head, req) {
  // settings
  var deadlines = {
    "d1": 1486396800000,
    "d2": 1488211200000,
    "d3": 1489417200000
  };



  provides("json", function() {
    results = [];
    prev = null;
    i = 0;

    // Team-specific
    users = {};
    deliverables = {};
    currDeliverable = {};

    while (row = getRow()) {
      curr = row.value;

      if (i == 0)
        prev = curr;


      if (prev.team !== curr.team) {
        results.push({
          "team": prev.team,
          "deliverables": deliverables
        });

        users = {};
        deliverables = {};
        currDeliverable = {};
      }





      if (!currDeliverable[curr.deliverable]) {
        currDeliverable[curr.deliverable] = {
          "allTestNames": [],
          "everPass": [],
          "maxCoverage": 0
        };
      }

      // Some test names might not show up until later commits because tests can added during the deliverable. Sigh.
      // It is important that we *NOT* sort the names since it will throw off the index of earlier commits.
      var testNames = curr.passNames.concat(curr.skipNames).concat(curr.failNames);
      testNames.forEach(function(name) {
        if (currDeliverable[curr.deliverable].allTestNames.indexOf(name) < 0)
          currDeliverable[curr.deliverable].allTestNames.push(name);
      });



      var newPassTests = curr.passNames.filter(function(name) {
        // test is new if it is not in everPass
        return currDeliverable[curr.deliverable].everPass.indexOf(name) < 0;
      });
      var passContribution = newPassTests.length;
      var coverContribution = Math.max(0,curr.coverGrade-currDeliverable[curr.deliverable].maxCoverage);
      // NOT correct - not actual grade
      // var contrib = 0.8*passContribution + 0.2*coverContribution;

      currDeliverable[curr.deliverable].everPass = currDeliverable[curr.deliverable].everPass.concat(newPassTests);
      currDeliverable[curr.deliverable].maxCoverage = Math.max(curr.coverGrade,currDeliverable[curr.deliverable].maxCoverage);






      commit = {
        "commitSha": curr.commitSha,
        "timestamp": curr.timestamp,
        "passContribution": passContribution,
        "coverContribution": coverContribution,
        "grade": curr.finalGrade,
        "coverage": curr.coverGrade,
        "passCount": curr.passCount,
        "skipCount": curr.skipCount,
        "failCount": curr.failCount,
        "passTests": curr.passNames.map(function(testName) {
          return currDeliverable[curr.deliverable].allTestNames.indexOf(testName);
        }),
        "skipTests": curr.skipNames.map(function(testName) {
          return currDeliverable[curr.deliverable].allTestNames.indexOf(testName);
        }),
        "failTests": curr.failNames.map(function(testName) {
          return currDeliverable[curr.deliverable].allTestNames.indexOf(testName);
        })
      }

      if (!deliverables[curr.deliverable])
        deliverables[curr.deliverable] = {};

      var delvCommitters = deliverables[curr.deliverable];
      if (!delvCommitters[curr.user]) {
        delvCommitters[curr.user] = {
          "passContribution": passContribution,
          "coverContribution": coverContribution,
          "commits": [commit]
        }
      }
      else {
        delvCommitters[curr.user].passContribution += passContribution;
        delvCommitters[curr.user].coverContribution += coverContribution;
        delvCommitters[curr.user].commits.push(commit);
      }


      // if (deliverables[curr.deliverable]) {
      //   deliverable = deliverables[curr.deliverable];
      //   if (deliverable[curr.user]) {
      //     deliverable[curr.user].contrib += contrib;
      //     deliverable[curr.user].commits.push(commit);
      //   } else {
      //     deliverable[curr.user] = {
      //       "contribution": contrib,
      //       "commits": [commit]
      //     };
      //   }
      // } else {
      //   deliverables[curr.deliverable] = {};
      //   deliverables[curr.deliverable][curr.user] = {
      //     "contribution": contrib,
      //     "commits": [commit]
      //   };
      // }

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

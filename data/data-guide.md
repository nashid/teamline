Be sure to set the environment variables `DB_USER` and `DB_PASS` before running
the curl commands.

## Overview JSON
### Generate overview JSON
Substitute d1 with deliverable of choice.

```Shell
curl 'http://nicholascbradley.com:5984/results/_design/grades/_view/d1?group=true' \
  --user ${DB_USER}:${DB_PASS} \
  --output overviewD1.json
```

### Annotated Sample
```JS
{
  "team1": {
    /**
      * The percentage of AutoTest tests that were passed in the last commit
      * before the deadline.
      */
    "testGrade": "96.2000",
    /**
      * The percentage of lines of code that were covered by tests written by
      * the team for the last commit before the deadline.
      */
    "coverGrade": "93.0100",
    /**
      * The AutoTest grade before scaling by the restrospective/contribution
      * mark. Composed of 80% of the percentage of tests passing and 20% of
      * the coverage grade. The marks are taken from the last commit before
      * the deliverable deadline.
      */
    "finalGrade": "95.5620",
    /**
      * Date of the commit in Unix epoch time (ms). Local time (GMT-8).
      */
    "timestamp":1486277879526
  },
  "team2": {
    "testGrade": "67.9000",
    "coverGrade": "81.0200",
    "finalGrade":"70.5240",
    "timestamp":1486396608585
  }
}
```

## Team JSON
### Generate contribution JSON for specific team
Change the team number as needed.

```Shell
curl 'http://nicholascbradley.com:5984/results/_design/teamline/_list/contribs/contribs-by-team?startkey=["team12"]&endkey=["team12",{},{}]' \
  --globoff \
  --user ${DB_USER}:${DB_PASS} \
  --output team12.json
```
### Annotated Sample
```JS
[
  {
    "team": "team127",
    "deliverables": {
      "d1": {
        /**
          * Release date of deliverable represented in Unix epoch time (ms).
          * Local time (GMT-8).
          */
        "released": 1484755200000,
        /**
          * Due date of deliverable represented in Unix epoch time (ms). Local
          * time (GMT-8).
          */
        "due": 1486396800000,
        /**
          * Code names for all tests that have passed, failed or been skipped.
          * New tests may be added during deliverable period: we check every
          * commit for new test names. Names not sorted because adding new names
          * would mess up index in older commits.
          */
        "testNames": ["Phoenix","Bender","BigFish",...],
        /**
          * The AutoTest grade before scaling by the restrospective/contribution
          * mark. Composed of 80% of the percentage of tests passing and 20% of
          * the coverage grade. The marks are taken from the last commit before
          * the deliverable deadline.
          */
        "finalGrade": "98.5700",
        /**
          * The percentage of AutoTest tests that were passed in the last commit
          * before the deadline.
          */
        "testGrade": "100.0000",
        /**
          * The percentage of lines of code that were covered by tests written by
          * the team for the last commit before the deadline.
          */
        "coverageGrade": "92.8500",
        "users":{
          "wangwei1113":{
            /**
              * Commits and their corresponding contribution made before the
              * deliverable deadline. These are the most important for determining
              * contribution since the final grade is based on the last commit
              * made before the deadline.
              */
            "beforeDeadline":{
              "contribution":{
                /**
                  * Percentage of the coverage score obtained by this user for
                  * this deliverable before the deadline. Computed as the sum of
                  * all increases made to the coverage score by this user. This
                  * acts as a proxy for the number of local tests written by the
                  * user which accounts for 20% of the final grade.
                  *
                  * Sum of coverageContrib for all commits made by this user.
                  */
                "coverage":"92.8500",
                /**
                  * Number of tests that were first passed in a commit made by
                  * this user.
                  *
                  * Sum of passCountNew for all commits made by this user.
                  */
                "passCount":53,
                /**
                  * Percentage of the test score obtained by this user for this
                  * deliverable before the deadline. Computed by dividing this
                  * user's passCount by the total number of passing tests for the
                  * team.
                  *
                  * i.e. user1.passCount * 100 / (user1.passCount + user2.passCount)
                  *
                  * Note: if the team's pass count is 0, this value will be 0.
                  */
                "tests":"100.0000",
                /**
                  * The overall contribution made by the user before the deadline
                  * for the deliverable. It is composed of 80% tests contribution
                  * and 20% coverage contribution.
                  *
                  * i.e. 0.8*tests + 0.2*coverage
                  */
                "overall":"100.0000"
              },
              "commits":[
                {
                  /**
                    * Date of the commit in Unix epoch time (ms). Local time (GMT-8).
                    */
                  "timestamp":1485368879697,
                  /**
                    * AutoTest grade on the commit computed as 80% test pass rate
                    * plus 20% coverage.
                    */
                  "grade":"9.5900",
                  /**
                    * Percentage of lines of code executed by the team's test suite
                    * in this commit.
                    *
                    * e.g. this commit contained a test suite with tests that
                    * executed ~40% of all of the executable code in the commit.
                    */
                  "coverage":"39.5500",
                  /**
                    * The increase made to the maximum coverage of any commit seen
                    * so far for this deliverable.
                    *
                    * i.e. Math.max(0,curr.coverGrade-currDeliverable.maxCoverage)
                    */
                  "coverageContrib":"39.5500",
                  /**
                    * Number of AutoTest tests that passed when run against this
                    * commit.
                    *
                    * i.e. length of passTests.
                    */
                  "passCount":1,
                  /**
                    * Number of tests that were passed for the first time in this
                    * deliverable.
                    */
                  "passCountNew":1,
                  /**
                    * Percentage of new passing tests in this commit to the total
                    * number of tests passed by the team. It represents the
                    * contribution of this commit to the total number of passing
                    * tests.
                    *
                    * i.e. passCountNew * 100 / (user1.passCount + user2.passCount)
                    */
                  "passPctNew":"1.8868",
                  /**
                    * Number of AutoTest tests that were skipped when run against
                    * this commit.
                    *
                    * i.e. length of skipTests.
                    */
                  "skipCount":0,
                  /**
                    * Number of AutoTest tests that failed when run against this
                    * commit.
                    *
                    * i.e. length of failTests.
                    */
                  "failCount":47,
                  /**
                    * Indexes of tests that passed. Use values to look up test
                    * names in testNames array for this deliverable.
                    */
                  "passTests":[ 0 ],
                  "skipTests":[  ],
                  "failTests":[ 1, 2, 3, ... ]
                },
                ...
              ]
            },
            /**
              * Commits made after the deadline. Teams may wish to fix failing
              * tests after the deliverable deadline so we capture this here.
              * These are less important for determining contribution for the
              * current deliverable but may give some insight into the work done
              * for the next deliverable.
              */
            "afterDeadline":{
              "contribution":{
                "coverage":"1.0600",
                "passCount":0,
                "tests":"0.0000",
                "overall":"20.0000"
              },
              "commits":[ ... ]
            }
          },
          "HingisSong":{
            "beforeDeadline":{
              "contribution":{
                "coverage":"0.0000",
                "passCount":0,
                "tests":"0.0000",
                "overall":"0.0000"
              },
              "commits":[ ... ]
            },
            "afterDeadline":{
              "contribution":{
                "coverage":"0.0000",
                "passCount":0,
                "tests":"0.0000",
                "overall":"0.0000"
              },
              "commits":[ ... ]
            }
          }
        }
      }
    }
  }
]
```

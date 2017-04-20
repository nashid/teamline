# Data Description
## Generate JSON file
```Shell
curl 'http://nicholascbradley.com:5984/results/_design/teamline/_list/contribs/contribs-by-team' \
  --user ${DB_USER}:${DB_PASS} \
  --output teamline-data.json
```

Be sure to set the environment variables `DB_USER` and `DB_PASS` before running
the curl commands.

## Abbreviations and Naming
  - grd = grade
  - cvg = coverage
  - ctb = contribution
  - cnt = count
  - pct = percent
  - p = pass
  - s = skip
  - f = fail

## Annotated Sample
```javascript
{
  "deliverables": {
    "d1": {
      /**
        * Release date of deliverable represented in Unix epoch time (ms).
        * Local time (GMT-8).
        */
      "release": 1484755200000,
      /**
        * Code names for all tests that have passed, failed or been skipped.
        * New tests may be added during deliverable period: we check every
        * commit for new test names. Names not sorted because adding new names
        * would mess up index in older commits.
        */
      "due": 1486396800000
    },
    "d2": { ... },
    "d3": { ... }
  },
  "teams": {
    "team10": {
      "d1": {
        /**
          * The AutoTest grade before scaling by the restrospective/contribution
          * mark. Composed of 80% of the percentage of tests passing and 20% of
          * the coverage grade. The marks are taken from the last commit before
          * the deliverable deadline.
          */
        "grd": "95.5620",
        /**
          * The percentage of AutoTest tests that were passed in the last commit
          * before the deadline.
          */
        "pGrd": "96.2000",
        /**
          * The percentage of lines of code that were covered by tests written by
          * the team for the last commit before the deadline.
          */
        "cvgGrd": "93.0100",
        /**
          * Indication of how even the work was divided between team members.
          * 0 indicates one team member made a 100% contribution
          * 1 indicates perfectly uniform contribution among team members
          *
          * Sum of absolute differences in overall contribution between pairs of
          * team members. This gives a linear scale.
          *
          * E.g. Since hlee2052's overall contribution was 81% and UnitaryOperator's
          * overall contribution was 19%, the distribution was about 20% uniform.
          */
        "ctbDist": "0.1928",
        "users": {
          "hlee2052": {
            "ctb": {
              /**
                * Percentage of the coverage score obtained by this user for
                * this deliverable before the deadline. Computed as the sum of
                * all increases made to the coverage score by this user. This
                * acts as a proxy for the number of local tests written by the
                * user which accounts for 20% of the final grade.
                *
                * Sum of coverageContrib for all commits made by this user.
                */
              "cvg": "81.8100",
              /**
                * Number of tests that were first passed in a commit made by
                * this user.
                *
                * Sum of passCountNew for all commits made by this user.
                */
              "pCnt": 23,
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
              "tests": "79.3103",
              /**
                * The overall contribution made by the user before the deadline
                * for the deliverable. It is composed of 80% tests contribution
                * and 20% coverage contribution.
                *
                * i.e. 0.8*tests + 0.2*coverage
                */
              "overall": "80.7205"
            },
            "commits": [
              {
                /**
                  * Date of the commit in Unix epoch time (ms). Local time (GMT-8).
                  */
                "time": 1485383382829,
                /**
                  * AutoTest grade on the commit computed as 80% test pass rate
                  * plus 20% coverage.
                  */
                "grd": "13.7620",
                /**
                  * The increase made to the maximum coverage of any commit seen
                  * so far for this deliverable.
                  *
                  * i.e. Math.max(0,curr.coverGrade-currDeliverable.maxCoverage)
                  */
                "cvg": "68.8100",
                /**
                  * The increase made to the maximum coverage of any commit seen
                  * so far for this deliverable.
                  *
                  * i.e. Math.max(0,curr.coverGrade-currDeliverable.maxCoverage)
                  */
                "cvgCtb": "68.8100",
                /**
                  * Number of AutoTest tests that passed when run against this
                  * commit.
                  */
                "pCnt": 0,
                /**
                  * Number of tests that were passed for the first time in this
                  * deliverable.
                  */
                "pCntNew": 0,
                /**
                  * Percentage of new passing tests in this commit to the total
                  * number of tests passed by the team. It represents the
                  * contribution of this commit to the total number of passing
                  * tests.
                  *
                  * i.e. passCountNew * 100 / (user1.passCount + user2.passCount)
                  */
                "pPctNew": "0.0000",
                /**
                  * Number of AutoTest tests that were skipped when run against
                  * this commit.
                  */
                "sCnt": 48,
                /**
                  * Number of AutoTest tests that failed when run against this
                  * commit.
                  */
                "fCnt": 0,
                /**
                  * Coverage contribution accumulated from over all earlier commits.
                  */
                "cvgCtbAcc": "68.8100"
              },
              {
                "time": 1485471676171,
                "grd": "17.4200",
                "cvg": "71.1000",
                "cvgCtb": "2.2900",
                "pCnt": 2,
                "pCntNew": 2,
                "pPctNew": "6.8966",
                "sCnt": 0,
                "fCnt": 48,
                "cvgCtbAcc": "71.1000"
              }
            ]
          },
          "UnitaryOperator": {
            "ctb": {
              "cvg": "12.9200",
              "pCnt": 6,
              "tests": "20.6897",
              "overall": "19.2795"
            },
            "commits": [ ... ]
          }
        }
      }
    }
  }
}
```

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
  "d1": {
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
  },
  "d2": { ... },
  "d3": { ... }
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

### Generate contribution JSON for all teams
```Shell
teams=( team10 team100 team102 team103 team107 team108 team109 team11 team111 team112 team113 team114 team115 team116 team118 team12 team121 team122 team124 team126 team127 team128 team129 team13 team130 team132 team134 team135 team136 team138 team139 team14 team142 team144 team145 team146 team147 team148 team149 team15 team150 team151 team153 team154 team155 team156 team157 team158 team16 team160 team161 team162 team167 team168 team17 team170 team172 team173 team178 team179 team18 team181 team182 team183 team185 team188 team189 team19 team190 team191 team192 team193 team194 team195 team196 team197 team198 team199 team2 team21 team22 team23 team24 team25 team26 team27 team28 team3 team31 team32 team34 team35 team36 team37 team38 team39 team4 team40 team41 team42 team43 team45 team46 team47 team48 team5 team50 team51 team53 team54 team55 team57 team58 team59 team60 team65 team66 team67 team68 team7 team72 team73 team74 team77 team78 team80 team82 team83 team84 team85 team88 team89 team9 team91 team93 team94 team96 team97 team98 )

for team in "${teams[@]}"
do
  curl 'http://nicholascbradley.com:5984/results/_design/teamline/_list/contribs/contribs-by-team?startkey=["'${team}'"]&endkey=["'${team}'",{},{}]' \
    --globoff \
    --user ${DB_USER}:${DB_PASS} \
    --output $team.json
done
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
                    * Accumulated coverageContrib.
                    */
                  "coverageContribAcc":"39.5500",
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

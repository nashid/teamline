Commits are divided into two sets: before the deliverable and after the deliverable.

For every commit, we calculate two derived attributes:
  - _passCountNew_ = the number tests that have passed for the first time in this commit. Note: we don't care if they later fail the tests and them get them working agin.
  - _coverageContribution_ = the max of the current coverage grade minus the largest coverage grade obtained so far in the deliverable and 0. This ensures the coverage contribution stays between 0 and 100%. Note that we don't handle coverage churn: it is possible that some commits will remove local tests reducing coverage and then another commit will add different local tests that increases the coverage to the same amount, but the commits cover different code.

For each deliverable and user, we calculate the user's contribution _before_ the deadline and store the results in the _contribution_ object:
  - _passCount_: sum of _passCountNew_ for the user over all commits
  - _tests_: the percentage of tests that the user caused to pass for the first time [ = _passCountUserA_ / (_passCountUserA_ + _passCountUserB_) ]
  - _coverage_: sum of _coverageContribution_ for the user over all commits
  - _overall_: combined contribution (tests and coverage) for the user [ = 0.8*_tests_ + 0.2*_coverage_ ]
Note: that contribution is relative to the number of tests that were passed. That is, the team may have got 50% but one of the users could have made 100% of that.

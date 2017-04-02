# Contribution (derived attribute)
For every commit, we calculate two derived attributed:
  - _passContribution_ = the number tests that have passed for the first time ever in this commit.
  - _coverContribution_ = the max of the current coverage grade minus the largest coverage grade obtained so far in the deliverable and 0. This ensures the coverage contribution stays between 0 and 100%. Note that we don't handle coverage churn: it is possible that some commits will remove local tests reducing coverage and then another commit will add different local tests that puts the coverage but to the same amount, but they don't cover the same code.
then the total contribution for the commit is calculated using the 80/20 weighting applied to all grades. Thus, the _contribution_ = 0.8*_passContribution_ + 0.2*_coverContribution_.

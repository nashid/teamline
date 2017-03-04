Some notes:
 - [x] Mockup for team: _Affected Tests_ should list 4 test names.
 - [x] Mockup for users: user names should be shown at the bottom of the line
 - [x] Mockup: show that the scale is time (take a GitHub approach and break the line into dates)
 - []  Mockup: show 3 users on deliverable buttons

 - [] Include links to the commits (make points clickable)

 - Should we include not only change in number of passing tests but also if the
   submission added new tests? (Might be a bit challenging).



WorkSplit
ContributionPlot
Commitment
Balance
Agile
Timeline
TeamTimeline
TeamTime

*Teamline*





# Teamline

## Domain, task, and dataset

_CODE_ is a proposed visualization built on top a
AutoTest is a service developed and used at UBC for automatically grading student code in CPSC310. It is invoked every time a student pushes their code to GitHub. The output includes several test statistics including pass/fail and coverage. While the final grade is computed from this data using the latest invocation before the due date, the data from preceding runs is essentially unused.

## Expertise
I wrote autotest

## Proposed solution
In the lab after a deliverable/sprint is due, the TAs meet with their assigned
teams to conduct a sprint retrospective to discuss any challenges that arose
during the sprint and to ensure that the work was equitably distributed among the
2-3 team members. This typically consists of a TA asking some questions designed to
gauge a student's comprehension of the task and code. We may go so far as to
explicitly and privately ask each student how evenly they felt the workload was
split. The TAs assign a scaling factor to the deliverable grade. For example, if
the team got 90% on the deliverable but one member did most of the work, the final
grades might be 90%\*1.0 = 90% and 90%\*don0.6 = 54%. Unfortunately, it can be hard
to determine how much work was done by each student from these conversations since
the team member who contributed very little will attempt to spoof the TA while the
hard-working one may not want to rat out their partner. One possible solution is
to look at the commit history on GitHub to determine how many commits each student
made. This can be a decent proxy but can be misleading since different people have
different commit habits (some will commit every line, others only large changes)
and they may not reflect the actual contribution to the grade (i.e. commits that
don't directly increase the grade).

Our solution is to create a derived attribute _commitContribution_ that describes
the impact of a commit on the grade. Since the projects are graded by running them
against a test suite (consisting of 30-60 tests), the _commitContribution_ attribute
will take integer values indicating the change in the number of tests passing for
each submission. We visualize this along with other code metrics (Fig. 1) to gain a more
complete understanding of each student's contribution: those student's who made
more commits that increased the number of passing tests should receive a higher
retrospective grade. Note that this visualize is designed to assist the TAs in
making a judgment when assigning a grade and cannot replace them since students may
have chosen a different way to divide the work among team members. One common
example is that one student will write unit tests for the other to pass.

D3 is selected by default being the most recent, passed deadline. D4 is already
displaying some information because this team has begun work on it. D1 and D2 are
completed and the summary metrics are given.

- magnified bubbles

## Scenario
We describe the scenario from the perspective of a TA doing a retrospective with
a



## Implementation approach
AutoTest's existing infrastructure uses web standards. In particular, it uses a
NoSql database that serves JSON content via a REST API. This suggests that the
most natural implementation would be web-based using HTML/CSS, JavaScript and REST
calls. The visualization library will be D3.js and possibly one or more libraries
built on top of D3.
- Usable by TAs: it can be integrated with the existing web dashboard and used
  during the retrospective or while entering the grades into the grade manager.

## Milestones and schedule
Total hours: 100 hours (50 pp)
 - Implementation: 50 hours (done by April 7th)
 - Paper + Presentation: 50 hours

Nick: Backend-views, some frontend
Felix: Frontend


- Mention how constructed (left "tabs" can be done faster that right vis)



## Previous work
 - GitHub/BitBucket network
 - ShiViz
 - OS X Dock (for Zoom)

## Bibliography
- ShiVis

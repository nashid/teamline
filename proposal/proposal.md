# Teamline: _Visualizing small-team code contributions_

## Proposal Management
Some notes:
 - [x] Mockup for team: _Affected Tests_ should list 4 test names.
 - [x] Mockup for users: user names should be shown at the bottom of the line
 - [x] Mockup: show that the scale is time (take a GitHub approach and break the line into dates)
 - [ ] Mockup: show 3 users on deliverable buttons
 - [ ] Include links to the commits (make points clickable)
 - [ ] +-X should show the %-change in the overall grade, not the number of tests
       with a changed status: Grade depends on both code and local test suite.
       Should include both types of contributions scaled by impact on grade.
       Change the meaning of the +-X to be the change in percentage of grade. For
       example, adding 10 test may increase coverage which might make the overall
       grade increase by 2%. So we should show this as +2.

Project name brainstorming:
  - WorkSplit
  - ContributionPlot
  - Commitment
  - Balance
  - Agile
  - Timeline
  - TeamTimeline
  - TeamTime
  - *Teamline*


## Introduction
Our tool visualizes data collected from AutoTest^, an automatic grading service
used to grade code submissions for students in CPSC310. The course is structured
around a term-long coding project that is divided into
5 deliverables/sprints completed by teams consisting of 2-3
students. The teams manage their shared code on GitHub^ using a basic git
workflow: students pull the latest code changes from GitHub, commit their modified
code locally and then push those commits to GitHub for other members to see. Every time a student
pushes their changes, AutoTest is automatically invoked and runs a private suite
of tests against the modified code. Results are stored in a NoSQL database with
each record corresponding to a single submission (push event). The relevant
attributes are briefly described in Table 1. We have collected data for over
24,000 submissions for the first two deliverables; complete data for the third
deliverable will be available on March 13. There are 285 students in 139 teams.

Table 1:
| Attribute Name | Description |
| -------------- | ----------- |
| testGrade      | Percentage of private tests that passed against student code. |
| coverageGrade  | Percentage of code executed by student written tests. |
| finalGrade     | Computed as 0.8*testGrade + 0.2*coverageGrade. |
| timestamp      | Unix time of record creation. |
| commitSha      | The (partial) SHA-1 hash of the submitted commit. |
| committer      | The GitHub ID of the student making the submission. |
| team           | The team number, stored as `teamXXX`, where `XXX` is a number between 2 and 199. |
| deliverable    | The submission deliverable, which can have values `d1`, `d2`, or `d3`. |

After a submission deadline, TAs meet with their assigned
teams to conduct a retrospective to discuss any challenges that arose
during the sprint and to ensure that the work was equitably distributed among the
team members. This typically consists of a TA asking some questions designed to
gauge a student's comprehension of the task and code. We may go so far as to
explicitly and privately ask each student how evenly they felt the workload was
split. The TAs assign a scaling factor to the deliverable grade. For example, if
the team got 90% on the deliverable but one member did most of the work, the final
grades might be 90%\*1.0 = 90% and 90%\*0.6 = 54%. Unfortunately, it can be hard
to determine how much work was done by each student from these conversations since
the team member who contributed very little will attempt to spoof the TA while the
hard-working one may not want to rat out their partner. One possible solution is
to look at the commit history on GitHub to determine how many commits each student
made. This can be a decent proxy but can be misleading since different people have
different commit habits (some will commit every line, others only large changes)
and they may not reflect the actual contribution to the grade (i.e. commits that
don't directly increase the grade).

## Proposed solution
Our solution is to create a derived attribute _commitContribution_ that describes
the impact of a commit on the grade. Since the projects are graded by running them
against a test suite (consisting of 30-60 tests), the _commitContribution_ attribute
will take integer values indicating the change in the number of tests passing for
each submission. We visualize this along with other code metrics (Fig. 1) to gain a more
complete understanding of each student's contribution: those student's who made
more commits that increased the number of passing tests should receive a higher
retrospective grade. Note that this visualization is designed to assist the TAs in
making a judgment when assigning a grade and cannot replace them since students may
have chosen a different way to divide the work among team members. One common
example is that one student will write unit tests for the other to pass.

We can
In the what-why-how framework




- Can be used by TA to zoom into interesting commits
- Really makes it hard for student to argue that they contributed when they didn't
- magnified bubbles

## Scenario
We describe the scenario from the perspective of a TA doing a retrospective with
a

D3 is selected by default being the most recent, passed deadline. D4 is already
displaying some information because this team has begun work on it. D1 and D2 are
completed and the summary metrics are given.




## Implementation approach
AutoTest's existing infrastructure uses web standards. In particular, it uses a
NoSql database that serves JSON content via a REST API. This suggests that the
most natural implementation would be web-based using HTML/CSS, JavaScript and REST
calls. The visualization library will be D3.js and possibly one or more libraries
built on top of D3.
- Usable by TAs: it can be integrated with the existing web dashboard and used
  during the retrospective or while entering the grades into the grade manager.

## Expertise
We decided on this project, in part, because we are both currently TAs for CPSC310
and have experienced the challenges of assigning a fair retrospective grade. In
addition, we are both excited to make use of the otherwise largely unused data.

In addition, Nick wrote and is currently managing the AutoTest system including
the database. As such, he has a total understanding of the data: how it was created,
its limitations, and some ways it can be meaningfully linked with other data sources
like GitHub.

Finally, this project is mildly interesting from a research perspective since it
is in our research area of software engineering. At a high level, it will be
interesting to see how software engineering students use the git workflow to
manage their project and collaborate with their team members.

## Milestones and schedule
Table 2: Total time for project 108 hours.

| Task                             | Est Time (hours) | Deadline | Description |
| -------------------------------- | ---------------- | -------- | ----------- |
| Pitch (x2)                       |                8 | Feb. 16  | Create slides, rehearse pitch. |
| Proposal                         |               12 | Mar. 6   | Discuss project ideas, create mockups, write proposal. |
| Project Review 1                 |                2 | Mar. 21  | Prepare slides. |
| Interim writeup                  |                6 | Mar. 31  | Summary of progress, completed previous work section. |
| Project Review 2                 |                2 | Apr. 2   | Prepare slides, have some version of demo ready. |
| Implementation                   |               48 | Apr. 7   | Completed vis tool. |
|  - Create database view          |                4 | Mar. 14  | Create view(s) of computed/derived attributes in CouchDB. |
|  - Create tabs/buttons           |                4 | Mar. 21  | Set up project frontend. Create navigation buttons. |
|  - Main vis (team view)          |               25 | Mar. 31  | Implement team view including fetching data, display/layout, interaction, animation. |
|  - Main vis (student view)       |               15 | Apr. 7   | Implement student view. Some of the team view implementation should be reusable. |
| Presentation                     |               10 | Apr. 25  | Prepare slides, demo, video(?). Rehearse. |
| Final paper                      |               20 | Apr. 28  | Finalize paper. Draft to be written Apr. 10-18. |



## Previous work
 - GitHub/BitBucket network
 - ShiViz
 - OS X Dock (for Zoom)

## Bibliography
- ShiVis









---
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

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
around a term-long coding project that is divided into 5 deliverables/sprints
(only the first 3 are graded using AutoTest and TA retrospective) completed by teams consisting of 2-3
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
| Attribute Name | Attribute Type | Description |
| -------------- | -------------- | ----------- |
| testGrade      | Quantitative   | Percentage of private tests that passed against student code. |
| coverageGrade  | Quantitative   | Percentage of code executed by student written tests. |
| finalGrade     | Quantitative   | Computed as 0.8*testGrade + 0.2*coverageGrade. |
| timestamp      | Ordered - Sequential | Unix time of record creation. |
| commitSha      | Categorical    | The (partial) SHA-1 hash of the submitted commit. |
| committer      | Categorical (current 285 values; max <1000) | The GitHub ID of the student making the submission. |
| team           | Categorical (current 139 values; max <1000) | The team number, stored as `teamXXX`, where `XXX` is a number between 2 and 199. |
| deliverable    | Ordered - Sequential | The submission deliverable, which can have values `d1`, `d2`, or `d3`. |

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


In the what-why-how framework

**What**. Table of graded submission records (items) with the attributes described in Table 1. The dataset is static once it has
been loaded on the page but is dynamic in that the dataset grows with each new
submission.

**Why**.
- Compare (contributions of the team members) and derive (retrospective grade for each of them)

**How**
- separate individual contributions from final team result and align them on two (or three)
  parallel axes by timestamp.
- submissions are represented by point marks that encode the number of submissions
  that are collapsed into a single mark (overlapping marks may be grouped into a point mark whose size encodes the number of collapsed marks)
- marks are coloured with luminance encoding the overall grade for the submission.
  Notice that this is relatively unimportant compared to the ability to accurately
  compare the number and effect of submissions. This information is also available
  by hovering over the point mark. For these reasons, we are okay using an encoding
  that is of low effectiveness and may not be visible on all marks.
- key data is always visible while interaction allows details about a submission to
  be seen.
   - hovering over a single point mark displays a popup with detail information about the submission
   - clicking a single points opens a new tab that displays the corresponding commit on GitHub
   - hovering over a grouped mark expands it to show all submissions it includes. Once expanded,
     the above interactions are allowed.



- Can be used by TA to zoom into interesting commits
- Really makes it hard for student to argue that they contributed when they didn't
- magnified bubbles

## Scenario
Imagine you are a TA tasked with scaling the final grade of each team member by
the amount they contributed. Upon meeting the team, you open their Teamline to
get a sense of the team dynamics: did they start early? did they work consistently?
what was their final grade? This information is immediately available to you
because Teamline defaults to showing the team-view of the most recently due deliverable.
Within the view, the you find that the team made a few early submissions that
increased their grade and then made a large number of submissions very close to
the deadline. From the navigation pane, you notice that one of the team members
contributed significantly to final grade unlike the other.

You then proceed to discuss with each team member individually about their contributions
to the project. The one who made the larger contribution according to Teamline, Bob,
had a clear understanding of the code and was able to discuss a couple of challenges
he encountered. At the end of the retrospective, Bob said that each of them had
done the work they agreed to do (which they thought was an even split) but that
his partner started very late which made him apprehensive.
To confirm this, you expand the team-view to show individual submissions made by
each team member and do in fact notice that all of the submissions for the other
member, Joe, were made the night before the due date and that Bobs submissions were
made earlier and more consistently.

Next, you talk to Joe. After he explains what he contributed, you mention that by
starting so late, it may negatively impact the group dynamic. Joe refutes this by claiming
that he started days earlier but, after you show him Teamline, agrees that he should
start earlier next time. While looking at Teamline, you also notice that Bob did
quite a bit more work for the previous deliverable as well. You point this out to
both Bob and Joe and they are a bit surprised. You help them divide up the work
for the next deliverable more equitably.

Later in the week, you decide to check how the team is proceeding. You immediately
see that several submissions were made. Curious to see if your discussion helped,
you expand the team-view and see that Joe has already made several submissions.
You feel much more confident having scaled back Joe's grade by only 20% since he
is now contributing more.

## Implementation approach
We have decided to implement Teamline as a web application. We decided on this for
a variety of reasons: our familiarity with web technologies, platform independence,
increase likelihood of adoption in CPSC310 (and other courses that will be using AutoTest),
and integration with other service used in the course. Teamline is minimally dependent
on existing AutoTest infrastructure, only requiring access to the database via a
REST endpoint, and is completely novel of the existing system including the dashboard.

Given the above, we will use HTML5, CSS3 and jQuery to implement our vis. With the
advances in CSS, we believe we will not need a vis-specific library like D3.js but
we will finalize this decision once we have started coding.

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



---
- Loose dependency on existing AutoTest infrastructure: REST endpoint for CouchDB.
- While there are existing visualizations (a dashboard and status page) using data
  collected by AutoTest, our vis is independent and novel of these.
- Web-based b/c most likely to be used by TAs. Can be integrated into GitHub Pages.
- HTML5/CSS3 and jQuery (with the advances in CSS we do not think we will need to use a vis library like D3.js)

We are building
Our project has only one dependency on existing AutoTest infrastructure
Our implementation is dependent on
AutoTest's existing infrastructure uses web standards. In particular, it uses a
NoSql database that serves JSON content via a REST API. This suggests that the
most natural implementation would be web-based using HTML/CSS, JavaScript and REST
calls. The visualization library will be D3.js and possibly one or more libraries
built on top of D3.
- Usable by TAs: it can be integrated with the existing web dashboard and used
  during the retrospective or while entering the grades into the grade manager.

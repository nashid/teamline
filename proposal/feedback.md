# Feedback from Tamara
Domain/Background/Expertise: great, 100% Outstanding introduction,
thorough yet concise.

Abstraction/Solution: good, 89%

Table 1 is a thing of glory - I wish everybody provided this level of
detail for their abstractions! So your data abstraction is great. The
terse task abstraction that you've written is useful as far as it
goes, but you'll want to unpack that down to the next level of detail
for your final report - discuss explicitly the connection between the
idea of "contribution" here and the different attributes in the data
abstraction.

I encourage you to think about how to impart more information via
direct visual encoding rather than as numbers/text, or worse yet only
through popups for detail on demand (meaning it's difficult to get the
overall gist since there's no overview).

Right now you're showing relatively few things perceptually, with real
visual encodings: the count of the aggregated items as point size
(augmented by the number itself as a label within the circle), and the
overall grade with saturation. Consider how to show the subcomponents
as well, testGrade and coverageGrade.

You're also showing the timestamp along an axis. (I note it's hard to
tell the exact time since your axis is only marked at start and end,
it's worth thinking about how to fit in some intermediate text as
well.)

It's not clear what the number right on top of the userid means (the
"+25" above "User1". Whatever that means, consider how to visually
encode that too! Ditto for the numbers to the right fo the stage name
(the 50% next to D3 in row 1). Maybe some of these are about the
division of labor? Since that's a primary goal, you should have those
be shown directly! And note that in your final report, you'll need to
explain explicitly (in words) how the attributes that you discuss in
Table 1 are handled in the visual encoding.

Also consider how much of the information now hidden away in the popup
could be shown directly in the main view. The most crucial are
probably grade, coverage, pass rate, and maybe also number of
submissions. The timestamp would be easier to understand from the
current display if you had some intermediate tick marks as I mention
above.  

Scenario: good/great, 95% The first part does a good job of matching
the text to the example figures, but the part about the previous
deliverable wasn't so clear - do you mean what we can see in Fig 2,
section D2 or D1? Or would that be a different screen altogether?

Implementation: great, 100%. Nice job of clearly indicating the
boundaries between this course project and the previous work of the
rest of the larger project as a whole, and also justifying the choice
of infrastructure.

Milestones: great, 100%. Stupendous, I will be pointing to this as an
example in subsequent years! It's exemplary that you've got both
wallclock estimates in hours for the work involved at the item level,
and calendar estimates of by when that work will be completed.

Previous Work: good, 89%. You've got a reasonable start on the related
work. Do make sure that when you cite work that's available at a URL
you check to see if there's also an academic paper - ShiViz for
example has one!

Style: great, 100%

# Feedback from Peer Review 1
## Reviewers
- Mahdi
- Hooman
## Comments
1. Why is it hard to detect whether people contributed or not withing 5 minutes. Because some people commit as they go, some people commit final works, but the TA’s don’t have time to investigate this in detail.
2. Clarified why the grades cannot be linked to the commits.
3. We wanted to see more clear distinction between percentage and number of tests
4. Suggested using up and down arrows next to numbers instead of + and – signs.
5. Comments were made about the size of commits. Which was something we hadn’t considered before? For example, someone writes a very long piece of code which is perfect but has a small bug so it doesn’t raise the grade. But then the partner fixes the bug and everything starts working so then he has a commit with 1 line that increases the grade by a large percentage. The current design doesn’t differentiate between the two.
6. More labels and legends to understand the encoding. Especially grades Vs. number of passed tests.
7. Color code user 1 and 2 so that you can see the distinction between the users on the graph (something we hadn’t considered before).
8. Write the dates on the graph and deadlines instead of submissions.
9. Add a scale to the time-line or some sort of labelling so you can detect the time amount in gaps instead of just being able to qualitatively compare them.
10. Provide better alignment between date labels and bubbles on the timeline. We had considered this before but decided against it because it would be resolved by our expansion/ collapsing interaction on the bubbles.
11.  The arrangement of bubbles along the timeline should be in a way that when two bubbles have the exact same time they are not next to each other (as opposed to being overlapped). We might think of a method to visualize this more explicitly. Based on available screen real state for example. Or using different color encodings.
12. Keeping multiple overlapping circles was suggested but it breaks our detail-on-hover interaction.
13. Importance of applying a maximum threshold to the combined commits (in terms of circle sizes) was brought up again, but this is something we had considered before. We, also, considered having only two sizes (1 commit) and more than 1 commit but decided against that so we can have higher level of granularity in expressions especially because size is a power channel.   
14. Some kind of legend was suggested to help explain the encodings, we might consider this for our finished product.

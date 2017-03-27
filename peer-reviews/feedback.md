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

# Proposal Feedback
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

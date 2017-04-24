# Teamline Interim Progress Report
We are about a week behind our schedule due to another course project taking longer
than expected. Fortunately, we have built in a large buffer near the end of the term to get caught up. That said, we have completed the view for getting
the data in the format need by our visualization. We will be spending next week
thinking about ways to visually encode more of our data attributes (instead of
just using a popup) and how to better show time on our main axis. After deciding
on something reasonable we will begin implementing the mockup of the combined
team view.

## Previous Work
Our vis was inspired by ShiViz\footnote{https://bestchai.bitbucket.io/shiviz/?} which shows messages being passed among
a collection of processes to verify the happens-before relation is not violated,
commit graphs like the one built into BitBucket\footnote{https://marketplace.atlassian.com/plugins/com.plugin.commitgraph.commitgraph/server/overview}
which visualize commits in time, the map view on Craigslist\footnote{https://vancouver.craigslist.ca/search/hhh} which shows size-encoded point marks, and the magnifying effect for the OS X dock.

In addition, research around team contribution and collaboration (e.g. \cite{Kelly:2016}) could help us further refine Teamline.


Similar problems
 - Can Visualization of Contributions Support Fairness in Collaboration?: Findings from Meters in an Online Game
 -


https://www.quora.com/Are-there-any-tools-to-analyze-or-visualize-the-contributions-to-a-Git-repository
http://ghv.artzub.com/


http://www.nytimes.com/interactive/2012/10/15/us/politics/swing-history.html

github visualizer

http://journals.plos.org/plosone/article?id=10.1371/journal.pone.0010937

http://journals.sagepub.com/doi/abs/10.1177/1473871611416549

http://www.vacet.org/vistools/comparative_vis.html

http://www.fj.ics.keio.ac.jp/pvis2014/doc/keynote2.pdf

Visual comparison for information visualization


Our visualization is designed to show each person's contribution to a team-based project. Therefore, the most critical aspect of our visualization is to give the user the ability to easily and accurately compare indicators of contribution over time. Much work has been done exploring effective ways in which to visualize comparisons over time. Gleicher, et. al. [1] give provide a taxonomy of visual designs for comparison noting that all designs are assembled using juxtaposition, superposition and explicit encodings. These topics are discussed explicityly 

- general comparison using vis.
- team collaboration

- our work is inspired by ...
  - http://www.nytimes.com/interactive/2012/10/15/us/politics/swing-history.html

- existing tools are...
  - https://help.github.com/articles/viewing-contribution-activity-in-a-repository/
  - http://ghv.artzub.com/
  - discussion on issues with GitHub's contribution graph
    - http://erik.io/blog/2016/04/01/how-github-contribution-graph-is-harmful/
    - https://github.com/isaacs/github/issues/627

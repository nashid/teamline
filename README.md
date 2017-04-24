# Teamline: Visualizing small team code contributions

## Demo
You can view the visualization at https://nickbradley.github.io/teamline.

## Code directories
  - The `docs` directory contains the release version of the code.
  - The `src` directory contains the development version:
    - `/db/contribs-by-team.js` is the view file that runs on CouchDB to extract the required fields from each record.
    - `/db/contribs.js` is the list function that takes the output of the `contribs-by-team` view and computes the team/user aggregates and the derived attributes. It also runs on CouchDB.

The `data-guide.md` describes the fields in the `teamline-data-min.json` data file.

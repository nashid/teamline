# Teamline: Visualizing small team code contributions

## Demo
You can view the visualization at https://nickbradley.github.io/teamline.

## Code directories
  - The `docs` directory contains the release version of the code.
  - The `src` directory contains the development version:
 	- `/db` contains the files to generate the dataset (backend)
    	- `contribs-by-team.js` is the view file that runs on CouchDB to extract the required fields from each record.
    	- `contribs.js` is the list function that takes the output of the `contribs-by-team` view and computes the team/user aggregates and the derived attributes. It also runs on CouchDB.
  	- `/frontend` contains all source files required for the frontend
		- `index.html`: single HTML file that contains the base markup and templates
  		- `css/lib/bootstrap.min.css`: Twitter Bootstrap for some straight-forward layouting
  		- `css/lib/nv.d3.css`: NVD3 styles
  		- `css/teamline.css`: Our own styles
  		- `js/lib/handlebars.js`: Handlebars is our templating engine
  		- `js/lib/moment.js`: Moment for date formatting
  		- `js/lib/d3.v3.min.js`: D3 as our core chart library
  		- `js/lib/nv.d3.min.js`: NVD3 on top of D3
  		- `js/lib/jquery-3.2.0.min.js`: jQuery for DOM manipulation and better general JavaScript programming
  		- `js/teamline.js`: Our own script that contains our core functionality

The `data-guide.md` describes the fields in the `teamline-data-min.json` data file.

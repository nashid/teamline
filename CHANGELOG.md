## Teamline 0.1 (2017-04-11)

This is a working initial base version. The Teamline frontend source files are in /src/frontend. I added SASS/Compass to the project which has its configuration in config.rb. You can setup Compass in your local environment and call `compass watch` in the frontend directory for auto-compilation on save. I also added the Handlebars templating engine. Templates are in index.html.

I developed with the local dev server spinned up by IntelliJ by clicking on the Run button for index.html.

Libraries: jQuery, D3, NVD3, Twitter Bootstrap, Handlebars, Moment

The source files are basically index.html, teamline.js and teamline.scss. The general pattern behind the JavaScript is that there is one global state object that is the base on what is shown in the page. When the state changes (with updateState), the UI can be redrawn (with updateView). This keeps our environment clean and we can upgrade to use the History API later if we want.

The data is taken from the `/data` directory. I'm now using the overview data yet because it didn't contain much. I'm mocking data instead. The data for teams is already taken from the directory with file names like 'team10.json'. If data for a team is not available, the chart won't show up. It works great for the (2-member-)teams that are there (12, 78, 178).

Overview View: the overview is a simple HTML table whose cells have a background based on HSL. This enables us to change the luminance based on the team's grade. This is currently mocked by creating random numbers for each team and deliverable.

Team View: the team view is shown upon click on a overview table cell. It draws our visualization as discussed using NVD3. It's a good basis that we still need to fine-tune. The results should be checked for validity. We also need to discuss what time range we want to show. I didn't find a `deliverableStartDate` so I simply started with "2 weeks before due date". I'm also showing one day after the due date to make the deadline appear nicer in the diagram.
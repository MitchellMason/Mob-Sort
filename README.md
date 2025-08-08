
# About
This project was built to enable a group of people to come together and argue about how a list of something should be ordered. Using [merge sort](https://en.wikipedia.org/wiki/Merge_sort), the audience will get their results with the minimum number of comparisons (O(n log n)). 

# How to use
Download the code base and use webpack to combine into a .html file. Mob Sort runs entirely on the front end, avoiding the need for servers by accepting uploaded Excel files (.xlsx). Generate a file in Excel or a FOSS alternative with the following format:

|Main Category|Amplifying Info 1|Amplifying Info 2|
|--|--|--|
|--|--|--|

Your `Main Category` should be named something related to what you're trying to sort with a group. For example, "Ice Cream Flavor", "Movie", etc. It is the only required column. 

Any column after that is additional info that will help contextualize the decision. This could be "Calories per bite", "Release year", or similar. This data will be displayed alongside the name of the item the group is sorting. 

With your Excel sheet and .html file ready to go, open Chrome (or other modern browser of choice) and upload your spreadsheet. 

# Utilized libraries

 - Front End:
	 - [Bootstrap](https://getbootstrap.com/)
	 - [Webpack](https://webpack.js.org/)
 - Data Handling
	 - [sheetJS](https://sheetjs.com/) for loading in code
	 - [LibreOffice Calc](https://www.libreoffice.org/discover/calc/) to generate test sheets (not required.)

 

import $ from './jquery.js'
import XLSX from './xlsx.mini.min'

/**
 * A collection of helper methods to generate buttons, tables, and jumbotrons.
 */
class UserInterfaceBuilder {
    constructor() {
    }

    makeButton = (id, onLoad) => {
        let button = $(`<input class='form-control' type='file' id='${id}' style="max-width: max-content">`)
        button.on('change', onLoad)
        return button;
    }

    makeNavBar = (onLoad) => {
        let navbar = $('<nav class="navbar navbar-expand-lg" style="background-color: #6f42c1"></nav>')
        // The brand goes in the top left
        navbar.append($(`<a class="navbar-brand" href="#" style="padding-left: 15px">Mob Sort</a>`))

        // put the file loader right in the nav bar
        let button = $(this.makeButton('spreadsheetUpload', onLoad))
        navbar.append(button)
        return navbar;
    }

    /**
     * Makes the statis jumbotron element explaining what format the uploaded excel sheet must take for this to work.
     * @return {*|jQuery|HTMLElement}
     */
    makeNoDataJumboTron = () => {
        let jumbotron = $('<div class="jumbotron jumbotron-fluid"></div>')
        let container = $('<div class="container"></div>')


        container.append($('<h1 class="display-4">Welcome to Mob Sort</h1>'))
        container.append($('<p class="lead">This application helps groups of people sort lists. Begin by uploading ' +
            'a spreadsheet at the top of the page. The spreadsheet should be formatted like so:</p>'))

        container.append($('<hr class="my-4">')); // simple line across the screen for dividing the space

        // make a table that shows what the application requires from the spreadsheet
        let sampleTableKeys = [
            'Sort Item Title (the *thing* you want to sort)',
            '(optional) Amplifying Info 1',
            '(optional) Amplifying Info 2'
        ]
        let sampleTable = []
        for(let i = 0; i < 3; i++){
            sampleTable.push(
                {
                    'Sort Item Title (the *thing* you want to sort)': `Sort Item ${i+1}`,
                    '(optional) Amplifying Info 1': `Amplifying Info 1-${i+1}`,
                    '(optional) Amplifying Info 2': `Amplifying Info 2-${i+1}`,
                }
            )
        }
        container.append(this.arrayToBootstrapTable(sampleTable, sampleTableKeys))

        container.append($('<hr class="my-4">'));

        container.append($('<p class="lead">For a more practical example: </p>'))

        container.append($('<hr class="my-4">'));

        // illustrate with a table of data on Harry Potter movies (something people would argue about):
        let hpKeys = ['Movie Title', 'Release Year', 'Run Time (minutes)', 'Box Office Earnings'];
        let hpData = [
            {'Movie Title': 'Sorcerer\'s Stone', 'Release Year': 2001, 'Run Time (minutes)': 152, 'Box Office Earnings': '$1.024 billion'},
            {'Movie Title': 'Chamber of Secrets', 'Release Year': 2002, 'Run Time (minutes)': 161, 'Box Office Earnings': '$882.5 million'},
            {'Movie Title': 'Prisoner of Azkaban', 'Release Year': 2004, 'Run Time (minutes)': 142, 'Box Office Earnings': '$808.5 million'},
        ]
        container.append(this.arrayToBootstrapTable(hpData, hpKeys))

        container.append($('<hr class="my-4">'));

        container.append($('<p class="lead">And so on. Additional columns of data past the first will also appear in ' +
            'the ranking UI. They are not required, but can be helpful for the audience.</p>'))

        jumbotron.append(container);
        return jumbotron;
    }

    /**
     * Convert an array of objects into an HTML table.
     * @param rows{[{}]} - The rows of data, where each row contains an object with keys accessed by the items in `headers`
     * @param headers{string[]} - The first row of the table, and the list of keys for each item in `rows`
     * @return {*|jQuery|HTMLElement}
     */
    arrayToBootstrapTable = (rows, headers) => {
        let table = $('<table class="table table-dark" style="width: max-content"></table>');
        // start with the header data
        let tableHeader = $('<thead></thead>')
        let tableHeaderRow = $('<tr></tr>')
        for(const header of headers){
            tableHeaderRow.append(`<th scope="col">${header}</th>`)
        }
        tableHeader.append(tableHeaderRow);
        table.append(tableHeader)

        // then add the data contained in each row
        let tBody = $('<tbody></tbody>')
        for(const row of rows){
            let rowHtml = $('<tr></tr>');
            rowHtml.append(
                headers.map(function (v,i) {
                    return $(`<td>${row[v]}</td>`)
                })
            )
            tBody.append(rowHtml)
        }
        table.append(tBody)
        return table;
    }

    /**
     * Creates a confirmation screen displaying the data to the user.
     * @param data{[{}]}
     * @param nextScreen{function()}
     * @return {*|jQuery|HTMLElement}
     */
    confirmationScreen = (data, nextScreen) => {
        let jumbotron = $('<div class="jumbotron jumbotron-fluid"></div>')
        let container = $('<div class="container"></div>')

        // get the keys (and the main key) from the data. The main key is the thing we're really sorting, and should
        // be the first key in the list. Use that to make the title of the confirmation screen
        let keys = Object.keys(data[0])
        let mainKey = keys[0]
        container.append($(`<h1 class="display-4">Mob Sort - ${mainKey}</h1>`))

        // Show the user what they uploaded
        let table = this.arrayToBootstrapTable(data, keys);
        container.append(table);

        // Finally, make the button that allows them to proceed.
        let confirmButton = $('<button type="button" class="btn btn-primary">Proceed</button>')
        confirmButton.on('click', nextScreen)
        container.append(confirmButton);

        jumbotron.append(container);
        return jumbotron;
    }

    /**
     * Presents the choice of two options to the audience
     * @param decisionsMade{number} - how many decision have been made
     * @param outOf{number} - Theoretical max number of decisions that could be made
     * @param left{any} - the data composing one option
     * @param leftButtonId{string} - id of the button that indicates the user picked `left`
     * @param right - the data composing the other
     * @param rightButtonId{string} - id of the button that indicates the user picked `right`
     * @return {*|jQuery|HTMLElement}
     */
    presentChoice = (decisionsMade, outOf, left, leftButtonId, right, rightButtonId) => {
        let toReturn = $(`<div class="container"></div>`)

        // Start with the header
        let headerDiv = $(`<div class="jumbotron jumbotron-fluid text-center"></div>`)
        let mobSortTitle = Object.keys(left)[0]
        headerDiv.append($(`<h1>${mobSortTitle}</h1>`))
        headerDiv.append($('<p class="lead">Progress bar measured against theoretical max number of comparisons</p>'))


        let progress = Math.floor(100 * (decisionsMade / outOf))
        let progBar = $(`
<div class="progress">
    <div class="progress-bar" role="progressbar" style="width: ${progress}%" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"></div>
</div>`)
        headerDiv.append(progBar)

        headerDiv.append($('<hr class="my-4">'))

        // Now present the choices as a deck of cards
        let choiceContainerDiv = $(`<div class="container"></div>`)
        let rowDiv = $(`<div class="row"></div>`)

        let leftColDiv = $(`<div class="col-lg"></div>`)
        let rightColDiv = $(`<div class="col-lg"></div>`)
        leftColDiv.append(this.buildChoiceCard(left, leftButtonId,'This one'))
        rightColDiv.append(this.buildChoiceCard(right, rightButtonId,'That one'))

        rowDiv.append(leftColDiv)
        rowDiv.append(rightColDiv)
        choiceContainerDiv.append(rowDiv)

        toReturn.append(headerDiv)
        toReturn.append(choiceContainerDiv)
        return toReturn;
    }

    /**
     * Builds the UI that presents an option to the user
     * @param data{any} - an object where the first Key/Value pair is the highlighted (h1) one, and the rest amplify the
     * data
     * @param buttonId{string} - ID of the button in the DOM
     * @param buttonText{string} - What the button should say if this one is selected
     * @return {*|jQuery|HTMLElement}
     */
    buildChoiceCard = (data, buttonId, buttonText) => {
        let toReturn = $(`<div class="card mb-4 box-shadow"></div>`)
        let cardHeaderDiv = $(`<div class="card-header"></div>`)
        let cardBodyDiv = $('<div class="card-body"></div>')

        // get the keys (and the main key) from the data. The main key is the thing we're really sorting, and should
        // be the first key in the list. Use that to make the title of the confirmation screen
        let keys = Object.keys(data)
        let mainKey = keys.shift()
        cardHeaderDiv.append($(`<h4 class="display-4">${data[mainKey]}</h4>`))

        // show the amplifying data if there is any.
        if(keys.length > 0){
            let table = $('<table class="table table-dark" style="width: max-content"></table>')
            let tbody = $('<tbody></tbody>')
            for(const key in data){
                let row = $('<tr></tr>')
                let keyCell = $(`<td>${key}</td>`)
                let valueCell = $(`<td>${data[key]}</td>`)
                row.append(keyCell)
                row.append(valueCell)
                tbody.append(row)
            }
            table.append(tbody);
            cardBodyDiv.append(table);
        }

        // Finally, make the button that allows them to proceed.
        let confirmButton = $(`<button type="button" class="btn btn-primary" id="${buttonId}">${buttonText}</button>`)
        cardBodyDiv.append(confirmButton)

        toReturn.append(cardHeaderDiv)
        toReturn.append(cardBodyDiv)
        return toReturn;
    }

    /**
     * Shows the completed results of the crowd sort. Offers a button that will allow the user to download a
     * spreadsheet of the data.
     * @param data
     */
    showResults = (data) => {
        const contentDiv = $('#content');
        contentDiv.empty();

        const containerDiv = $('<div class="container"></div>')

        // Start with the header
        const headerDiv = $(`<div class="jumbotron jumbotron-fluid text-center"></div>`)
        headerDiv.append($(`<h1>Sorting complete</h1>`))

        // Create the table of results
        const headers = Object.keys(data[0])
        const table = this.arrayToBootstrapTable(data, headers)

        // Download button
        const button = $('<button type="button" class="btn btn-primary">Download Results</button>')
        button.on('click', function(){
            let workbook = XLSX.utils.book_new();

            // if `headers` are provided, we need to capture that option in XLSX
            let worksheet = XLSX.utils.json_to_sheet(data);

            // append the worksheet to the workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Mob Sort Results');

            // write out the final file
            XLSX.writeFile(workbook, "Mob Sort Results.xlsx")
        })

        containerDiv.append(headerDiv)
        containerDiv.append(table)
        containerDiv.append(button)

        contentDiv.append(containerDiv)
    }
}

export default UserInterfaceBuilder;
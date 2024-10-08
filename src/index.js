import UserInterfaceBuilder from "./js/userInterfaceBuilder";
import $ from './js/jquery.js';
import './css/bootstrap.css';
import XLSX from './js/xlsx.mini.min'

// the list of data uploaded by a spreadsheet and manipulated during sorting
let dataToSort = null;

// The flag that tells main() whether we need to make results or display them
let sortingComplete = false;

// The instance of UserInterfaceBuilder used to build the Interface
let uiHelper = new UserInterfaceBuilder();

// total amount of sorting decisions made by the mob so far
let totalDecisionMade = 0;

// The total amount of decisions that need to be made (initialized as null to show that this value is unknown for now)
let theoreticalMaxDecisions = null;

/**
 * Entry point for the application. Draws a prompt for data if there isn't any loaded. When there is a spreadsheet
 * available for sorting, launches the appropriate interface.
 */
let main = function(){
    console.log('Start')
    // empty the body to clear the screen
    let docBody = $('body')
    docBody.empty();

    // Begin with the title
    $(document).prop('title', 'Mob Sort');

    // Dark mode is the only mode we need
    $('html').attr('data-bs-theme', 'dark')

    // make and append the nav bar at the top
    let navbar = uiHelper.makeNavBar(spreadsheetOnLoad);
    docBody.append(navbar)

    // make a content div
    let contentDiv = $('<div id="content"></div>')
    docBody.append(contentDiv);

    // then, append the jumbotron pleading for data (if there isn't any)
    if(dataToSort === null){
        let jumbotron = uiHelper.makeNoDataJumboTron();
        contentDiv.append(jumbotron)
    }
    else{
        if(sortingComplete){
            showResults();
        }
        else{
            confirmData();
        }
    }
}

/**
 * Used after the data is loaded. Shows the user how the data will be presented on comparison cards.
 */
let confirmData = function(){
    let contentDiv = $('#content');
    contentDiv.empty();
    let confirmationScreen = uiHelper.confirmationScreen(dataToSort, mobSort)
    contentDiv.append(confirmationScreen);
}

/**
 * Called once the `dataToSort` array is populated. Uses `mergeSort` to sort the array while feeding the
 * `mobSortCompare` function to present the "mob" with the proper choice and information. After all necessary
 * comparisons are made, the 'Mob Rank' key is added to the list of objects and returned in order.
 */
let mobSort = async function(){
    console.log('Mob Sort', dataToSort);
    let contentDiv = $('#content');
    contentDiv.empty();
    theoreticalMaxDecisions = dataToSort.length * Math.log(dataToSort.length);
    dataToSort = await mergeSort(dataToSort, mobSortCompare)
    console.log('Complete!', dataToSort)

    let finalTableData = []
    for(let i = 0; i < dataToSort.length; i++){
        let item = dataToSort[i];
        let newItem = {
            'Mob Rank': i+1
        }
        for(const key in item){
            newItem[key] = item[key];
        }
        finalTableData.push(newItem);
    }
    dataToSort = finalTableData;
    sortingComplete = true;
    main();
}

/**
 * Merge sort implementation adapted from StackOverflow. It is the standard implementation save for the addition of
 * `await`. Permits the Mob Sort to conclude in fewer comparisons than quicksort (O(n ln n) verses O(n^2)).
 * @param array{[]}
 * @param fn{function(a,b): Promise<number>} - the async comparison function. Follows the same rules as javascripts native
 * `.sort()` implementation, except that it returns a Promise which resolves to a `number`.
 * @return {Promise<*>|[]}
 */
async function mergeSort(array, fn) {
    if (array.length <= 1) {
        return array;
    }
    const mid = Math.floor(array.length / 2)
    const left = array.slice(0, mid)
    const right = array.slice(mid);

    await mergeSort(left, fn);
    await mergeSort(right, fn);
    let ia = 0, il = 0, ir = 0;
    while (il < left.length && ir < right.length) {
        array[ia++] = (await fn(left[il], right[ir]) <= 0) ? left[il++] : right[ir++];
    }
    while (il < left.length) {
        array[ia++] = left[il++];
    }
    while (ir < right.length) {
        array[ia++] = right[ir++];
    }
    return array;
}

/**
 * This comparison function presents the "mob" with two options and asks them to choose the better one. Returns
 * @param left{any}
 * @param right{any}
 * @return{number} The return value should be a number whose sign indicates the relative order of the two elements:
 * negative if `left` is less than `right`, positive if `left` is greater than `right`, and zero if they are equal.
 */
async function mobSortCompare(left, right) {
    console.log('Comparing ', left, ' and ', right)
    let contentDiv = $('#content');
    contentDiv.empty();

    let leftButtonId = 'leftButton'
    let rightButtonId = 'rightButton'

    let choiceDiv = uiHelper.presentChoice(
        totalDecisionMade, theoreticalMaxDecisions,
        left, leftButtonId,
        right, rightButtonId
    );
    contentDiv.append(choiceDiv)

    let leftPromise = new Promise((resolve) => {
        let button = $(`#${leftButtonId}`)
        button.on('click', (e) => {
            e.preventDefault();
            resolve(-1)
        })
    })

    let rightPromise = new Promise((resolve) => {
        let button = $(`#${rightButtonId}`)
        button.on('click', (e) => {
            e.preventDefault();
            resolve(1)
        })
    })

    let decision = Promise.any([
        leftPromise,
        rightPromise
    ])

    // increment the global counter so the progress bar will grow
    totalDecisionMade++;

   return decision;
}

/**
 * Async function that processes the data from the passed event as a loaded file. Wraps the file in XLSX, saves to
 * the global `dataToSort` and recalls `main()`.
 * @param event
 * @return
 */
let spreadsheetOnLoad = async function (event) {
    // change the UI to reflect the fact that work is happening. Shows if `await` takes a while to get the file data
    let contentDiv = $('#content');
    contentDiv.empty();
    contentDiv.append(`<h1>Loading...</h1>`)

    const fileList = event.target.files;
    const fileData = await fileList[0].arrayBuffer();
    let workbook = XLSX.read(fileData)

    // presume the data we want is in the first sheet
    let workSheet = workbook.Sheets[workbook.Props.SheetNames[0]]

    // use XLSX to convert that into a JSON array of data
    dataToSort = XLSX.utils.sheet_to_json(workSheet, {});

    main();
}

/**
 * A function which passes the *sorted* `dataToSort` to uiHelper.
 */
let showResults = function(){
    uiHelper.showResults(dataToSort)
}

// Once the document has loaded, execute main()
document.addEventListener('DOMContentLoaded', function () {
    main();
});

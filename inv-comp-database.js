/* ==========================================================================
   Import a saved invoice company and rebuild it as an inv tax invoice.
   The result is the same invoice the "dataInput" textarea builds when a text
   is pasted in it, so anything the pasted text never builds is dropped here.
   ========================================================================== */




/* The only values that change between the Indonesia and the Thailand app */
const INV_COMP_TABLE_NAME = 'inv_comp_thai';
const INV_COMP_CONTENT_COLUMN = 'inv_company_thai_content';
const INV_TAX_NUMBER_PREFIX = 'SEA';
const INV_TAX_LOCATION_OPTIONS = ["Bangkok", "Phuket", "Krabi", "Pattaya", "Koh Samui", "Chiang Mai"];
const INV_TAX_FLIGHT_ROUTE_OPTIONS = ["BKK-HKT\nRETURN", "BKK-HKT", "HKT-BKK"];




/* The names dropdown is shared with the "Import" button, so remember what it shows */
let currentInvNamesDropdownMode = 'inv_tax';

/* Global array holding the name of every saved invoice company (filled page by page) */
let invCompAllFetchedData = [];








/* ==========================================================================
   Fetching the invoice companies
   ========================================================================== */

/* The newest names show up right away, the older ones keep loading in the background */
const invCompNamesLoader = createInvNamesLoader({
    tableName: INV_COMP_TABLE_NAME,
    contentColumn: INV_COMP_CONTENT_COLUMN,
    orderColumn: 'inv_company_user_current_date',
    containerId: 'all_supabase_stored_inv_tax_data_names_for_importing_data_div',
    namesStore: invCompAllFetchedData,
    onNameClick: (clickedName) => invCompImportContentForSelectedName(clickedName),
    /* Shown as "26__1584 Mr. Alsafran Fahad Ali", the same way the inv company app shows them */
    buildNameLabel: buildInvoiceNameLabelWithYear,
    cleanSearchText: cleanInvoiceNameSearchText,
    isActive: () => currentInvNamesDropdownMode === 'inv_comp'
});








/* ==========================================================================
   The shared names dropdown (the inv tax names or the invoice company names)
   ========================================================================== */

const renderInvNamesDropdownList = (mode) => {
    currentInvNamesDropdownMode = mode;

    const namesLoader = mode === 'inv_comp' ? invCompNamesLoader : invTaxNamesLoader;

    /* Every list starts with no selected name and a clean search bar */
    namesLoader.clearSelection();
    namesLoader.showList();
};




/* Opened by the "Import" button */
function openInvTaxImportDropdown() {
    renderInvNamesDropdownList('inv_tax');
    showOverlay('import_supabase_inv_tax_data_names_dropdown');
}


/* Opened by the "Import Inv Company" button */
function openInvCompImportDropdown() {
    renderInvNamesDropdownList('inv_comp');
    showOverlay('import_supabase_inv_tax_data_names_dropdown');
}








/* ==========================================================================
   Building the inv tax number out of the invoice company month, year & number
   ========================================================================== */

const invCompMonthNames = {
    JAN: 1, JANUARY: 1, JANUARI: 1,
    FEB: 2, FEBRUARY: 2, FEBRUARI: 2,
    MAR: 3, MARCH: 3, MARET: 3,
    APR: 4, APRIL: 4,
    MAY: 5, MEI: 5,
    JUN: 6, JUNE: 6, JUNI: 6,
    JUL: 7, JULY: 7, JULI: 7,
    AUG: 8, AUGUST: 8, AGU: 8, AGUSTUS: 8,
    SEP: 9, SEPT: 9, SEPTEMBER: 9,
    OCT: 10, OCTOBER: 10, OKT: 10, OKTOBER: 10,
    NOV: 11, NOVEMBER: 11, NOPEMBER: 11,
    DEC: 12, DECEMBER: 12, DES: 12, DESEMBER: 12
};


/* Read a stored value of the imported invoice company ('null' means it was never stored) */
const readInvCompStoredValue = (importedInvCompDiv, elementId) => {
    const storedValue = (importedInvCompDiv.querySelector(`#${elementId}`)?.textContent || '').trim();

    return (storedValue === '' || storedValue.toLowerCase() === 'null' || storedValue.toLowerCase() === 'undefined')
        ? ''
        : storedValue;
};


const invCompRomanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];


/* The stored month is a roman numeral ("VI"), but a number ("6") or a name ("Jun") is read too */
const invCompMonthToNumber = (month) => {
    if (!month) return null;

    const cleanedMonth = month.trim().toUpperCase();

    const romanMonthIndex = invCompRomanMonths.indexOf(cleanedMonth);
    if (romanMonthIndex !== -1) return romanMonthIndex + 1;

    if (/^\d{1,2}$/.test(cleanedMonth)) {
        const monthNumber = parseInt(cleanedMonth, 10);
        return (monthNumber >= 1 && monthNumber <= 12) ? monthNumber : null;
    }

    return invCompMonthNames[cleanedMonth] || null;
};


/* The stored year can be a full year ("2026") or a two digit year ("26") */
const invCompYearToNumber = (year) => {
    const yearDigits = (year || '').replace(/\D/g, '');

    if (yearDigits.length === 4) return parseInt(yearDigits, 10);
    if (yearDigits.length === 2) return 2000 + parseInt(yearDigits, 10);

    return null;
};


/* Used when the invoice company has no stored month or year */
const getInvTaxMonthAndYearFromRows = () => {
    const [monthName, year] = (printLatestFullMonthName() || '').split(' ');

    return {
        month: invCompMonthToNumber(monthName),
        year: invCompYearToNumber(year)
    };
};


/* The last part of the number is the number of the invoice company itself, which it
   stores next to its month and its year for this very import */
const getInvTaxNumberSequenceFromInvComp = (importedInvCompDiv) => {
    const storedInvNumber = readInvCompStoredValue(importedInvCompDiv, 'store_google_sheet_inv_number');

    /* A hand edited invoice company can keep a revision marker next to it ("0290 R1") */
    const invNumberDigits = (storedInvNumber.match(/\d+/) || [])[0];
    if (!invNumberDigits || parseInt(invNumberDigits, 10) === 0) return '';

    return invNumberDigits.padStart(4, '0');
};


/* Only used for the invoice companies that were saved before their number was stored.
   The last part of the number keeps running over all the months of the same year */
const getNextInvTaxNumberSequence = async (invNumberYearStart) => {
    /* The inv tax names are loaded page by page, so the last used number is
       only known once the background loading is over */
    await invTaxNamesLoader.whenAllNamesLoaded();

    const escapedStart = invNumberYearStart.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const startPattern = new RegExp(`^${escapedStart}[IVX]+-(\\d+)`, 'i');

    let latestSequence = 0;

    (allFetchedData || []).forEach(row => {
        const foundSequence = (row.name || '').trim().match(startPattern);

        if (foundSequence) {
            const sequenceNumber = parseInt(foundSequence[1], 10);
            if (sequenceNumber > latestSequence) latestSequence = sequenceNumber;
        }
    });

    return String(latestSequence + 1).padStart(4, '0');
};


/* Builds a number like "FID-26-I-0001", where only the prefix is fixed and the year,
   the month and the number all come from the imported invoice company */
const buildInvTaxNumberFromInvComp = async (importedInvCompDiv) => {
    let month = invCompMonthToNumber(readInvCompStoredValue(importedInvCompDiv, 'store_google_sheet_inv_orignal_month_value'));
    let year = invCompYearToNumber(readInvCompStoredValue(importedInvCompDiv, 'store_google_sheet_inv_orignal_year_value'));

    if (!month || !year) {
        const rowsMonthAndYear = getInvTaxMonthAndYearFromRows();

        if (!month) month = rowsMonthAndYear.month;
        if (!year) year = rowsMonthAndYear.year;
    }

    /* Nothing to build the number from, so it has to be typed by hand */
    if (!month || !year) return '';

    detectedInvoiceYear = year;

    const invNumberYearStart = `${INV_TAX_NUMBER_PREFIX}-${String(year).slice(-2)}-`;

    /* The stored number is the one the invoice company was given, so the inv tax invoice
       keeps it. Only an invoice company that never stored it falls back on the next
       free number of the year */
    const invNumberSequence = getInvTaxNumberSequenceFromInvComp(importedInvCompDiv)
        || await getNextInvTaxNumberSequence(invNumberYearStart);

    return `${invNumberYearStart}${convertToRoman(month)}-${invNumberSequence}`;
};


/* The revision of the imported invoice company ("26__0283-Rev1 Mr. Alwakr ..." -> "Rev1"),
   so the inv tax invoice ends up on the same revision ("FID-26-VIII-1595-Rev1").

   It is only read right after the number of the invoice company, so a "Rev1" sitting
   anywhere else ("26__0283 Mr. Alwakr ... Rev1") is not a revision */
const getInvCompRevisionMarker = (invCompName) => {
    /* The shown text keeps the year in front of the name ("26__0283-Rev1 ...") */
    const savedName = cleanInvoiceNameSearchText((invCompName || '').trim());

    /* The marker is written in many shapes ("-Rev1", " Rev 1", "-rev."), and the letters
       have to end there, so a guest name like "Reverend" is never read as one */
    const foundRevision = savedName.match(/^\d+\s*[-\s]\s*rev\.?\s*(\d*)(?![a-z0-9])/i);

    return foundRevision ? `Rev${foundRevision[1]}` : '';
};








/* ==========================================================================
   Building the inv tax rows out of the invoice company rows
   ========================================================================== */

/* Get the title of a row, e.g. "TOTAL" or "ALREADY PAID" */
const getInvCompRowTitle = (row) => (row.children[0]?.textContent || '').replace(/\s+/g, ' ').trim().toUpperCase();


/* The price is the last number of the row, e.g. "SAR      12,345".
   A hand edited invoice company can wrap it in extra tags, so the text is read, not the HTML */
const getInvCompRowPrice = (row) => {
    const foundPrices = (row.querySelectorAll('p')[1]?.textContent || '').match(/[\d.,]*\d/g);
    if (!foundPrices) return null;

    return parseInt(foundPrices[foundPrices.length - 1].replace(/[.,]/g, ''), 10) || null;
};


/* An invoice company can hold extra payment rows ("ALREADY PAID", "REFUND TO GUEST", ...),
   while the pasted text only ever builds one TOTAL row, so find the one price to ask for */
const getInvCompPriceToPay = (importedTotalRowsDiv) => {
    const allTotalRows = [...importedTotalRowsDiv.querySelectorAll('.invoice_company_row_div_class')];
    if (allTotalRows.length === 0) return null;

    const findRowsByTitle = (...titles) => allTotalRows.filter(row => titles.some(title => getInvCompRowTitle(row).includes(title)));

    /* The company already paid the total before, so only the rest of the payment is asked for */
    const remainingPaymentRows = findRowsByTitle('REMAINING PAYMENT', 'MUST PAY');
    if (remainingPaymentRows.length > 0) {
        const lastRemainingPaymentRow = remainingPaymentRows[remainingPaymentRows.length - 1];
        const remainingPayment = getInvCompRowPrice(lastRemainingPaymentRow);

        if (remainingPayment) return { row: lastRemainingPaymentRow, price: remainingPayment };
    }

    /* The company already paid the total before, so only the new costs are asked for */
    const additionalPaymentRows = findRowsByTitle('ADDITIONAL PAYMENT');
    if (additionalPaymentRows.length > 0) {
        const allNewCosts = additionalPaymentRows.reduce((newCostsSoFar, row) => newCostsSoFar + (getInvCompRowPrice(row) || 0), 0);

        if (allNewCosts) return { row: additionalPaymentRows[additionalPaymentRows.length - 1], price: allNewCosts };
    }

    /* Nothing was paid before, so the whole total is asked for */
    const totalRow = allTotalRows.find(row => getInvCompRowTitle(row) === 'TOTAL')
        || [...allTotalRows].reverse().find(row => getInvCompRowTitle(row).endsWith('TOTAL'))
        || [...allTotalRows].reverse().find(row => getInvCompRowTitle(row).startsWith('TOTAL'))
        || allTotalRows[allTotalRows.length - 1];

    const total = getInvCompRowPrice(totalRow);

    return total ? { row: totalRow, price: total } : null;
};


/* The inv tax price is the invoice company price minus the tax */
const buildInvTaxTotalRow = (importedTotalRowsDiv) => {
    const priceToPay = getInvCompPriceToPay(importedTotalRowsDiv);
    if (!priceToPay) return false;

    const totalRow = priceToPay.row;
    const priceElement = totalRow.querySelectorAll('p')[1];

    /* Build the price the same way the pasted text does: the typed transfer amount is the
       only thing it is built from, so this starts on the three red question marks until
       one is typed. The invoice company only says which row is the TOTAL one */
    priceElement.className = '';
    priceElement.setAttribute('style', 'padding: 5px 0');
    priceElement.innerHTML = buildInvTaxTotalPriceText();

    /* Give the row the same look the pasted text gives to the TOTAL row */
    totalRow.className = 'invoice_company_row_div_class last_invoice_company_row_div_class';
    totalRow.children[0].innerHTML = '<p class="duplicate_this_element_class">TOTAL</p>';
    priceElement.parentElement.id = 'inv_tax_total_price_div_id';

    /* Drop the extra payment rows */
    importedTotalRowsDiv.innerHTML = '';
    importedTotalRowsDiv.appendChild(totalRow);

    return true;
};


const buildInvTaxRowsFromInvComp = (importedInvCompDiv) => {
    const importedTable = importedInvCompDiv.querySelector("#invoice_company_main_table_div_id");
    if (!importedTable) return '';

    /* Work on a copy so the saved invoice company stays untouched */
    const rowsHolder = importedTable.cloneNode(true);

    /* The breakfast line is never built by the pasted text */
    rowsHolder.querySelectorAll('.breakfast_text_options_class').forEach(breakfastLine => breakfastLine.remove());

    /* Rebuild the TOTAL row with the inv tax price */
    const importedTotalRowsDiv = rowsHolder.querySelector("#total_price_row_div_id");
    if (importedTotalRowsDiv && !buildInvTaxTotalRow(importedTotalRowsDiv)) {
        importedTotalRowsDiv.remove();
    }

    return rowsHolder.innerHTML;
};








/* ==========================================================================
   Importing the selected invoice company
   ========================================================================== */

const invCompImportContentForSelectedName = async (clickedInvCompDataName) => {

    /* The first click only selects the name, the second one imports it */
    if (clickedInvCompDataName.style.backgroundColor !== 'rgb(0, 155, 0)') {

        // Reset the styles of every name, the searched out ones included (only one selected name at a time)
        invCompNamesLoader.clearSelection();

        // Set the background color and text color of the clicked <h3> element
        clickedInvCompDataName.style.backgroundColor = 'rgb(0, 155, 0)';
        clickedInvCompDataName.style.color = 'white';

        return;
    }


    /* Show the loading before the reading and the rebuilding hold the page still */
    await showInvImportLoading();

    // Read the saved content of the selected name
    const selectedName = clickedInvCompDataName.getAttribute('data-original-name') || clickedInvCompDataName.innerText.trim();
    const importedContent = await invCompNamesLoader.fetchContentForName(selectedName);

    if (!importedContent) {
        // Play a sound effect
        playSoundEffect('error');
        hideInvImportLoading();
        return;
    }

    // Play a sound effect
    playSoundEffect('success');


    /* Read the saved invoice company without touching the page */
    const importedInvCompDiv = document.createElement("div");
    importedInvCompDiv.innerHTML = importedContent;




    /* GUEST BY & NAME OF CLIENT (the same rules the pasted text follows) */
    const travelAgency = (importedInvCompDiv.querySelector("#current_used_company_name_p_id")?.textContent || '').trim();
    const clientName = (importedInvCompDiv.querySelector("#current_used_guest_name_p_id")?.textContent || '').trim().replace(/^\((.*)\)$/, '$1').trim();

    document.getElementById('current_used_company_name_p_id').innerText = travelAgency.toUpperCase() === 'RPIBADI' ? '' : travelAgency;
    document.getElementById("current_used_guest_name_p_id").innerHTML = clientName;




    /* The invoice rows (this has to run before building the number) */
    document.getElementById("invoice_company_main_table_div_id").innerHTML = buildInvTaxRowsFromInvComp(importedInvCompDiv);




    /* NO: (built out of the month, the year & the number stored in the invoice company,
       and carrying the revision of the invoice company when it has one) */
    const invTaxNumber = await buildInvTaxNumberFromInvComp(importedInvCompDiv);
    const invCompRevisionMarker = getInvCompRevisionMarker(selectedName);

    document.getElementById('current_used_inv_tax_p_id').innerText =
        (invTaxNumber && invCompRevisionMarker) ? `${invTaxNumber}-${invCompRevisionMarker}` : invTaxNumber;




    /* An imported invoice company is always a new invoice, so it has no revision yet */
    document.getElementById("current_used_rev_number_p_id").innerText = '';
    document.getElementById("store_supabase_current_inv_tax_rev_number_id").innerText = '1';




    /* Set Today's Date */
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][today.getMonth()];
    const year = today.getFullYear();

    document.getElementById("today_inv_company_date_p_id").innerText = `Date: ${day} ${month} ${year}`;




    /* Reset the main inv tax row title text */
    document.getElementById("main_inv_tax_row_column_1_id").innerText = 'Period';
    document.getElementById("main_inv_tax_row_column_2_id").innerText = 'Accommodation';
    document.getElementById("main_inv_tax_row_column_3_id").innerText = 'Location';
    document.getElementById("main_inv_tax_row_column_4_id").innerText = 'Length of stay';




    /* Hide the names dropdown */
    hideOverlay();


    /* Call a function to make all elements editable */
    makeDivContentEditable();


    // Call the function to enable the floating options functionality
    setupFloatingOptions(
        INV_TAX_LOCATION_OPTIONS,
        "location_text_options_class",
        option => option
    );

    setupFloatingOptions(
        ["1", "2", "3", "4", "5"],
        "flight_amount_text_options_class",
        option => `${option} Person`
    );

    setupFloatingOptions(
        INV_TAX_FLIGHT_ROUTE_OPTIONS,
        "flight_destination_text_options_class",
        option => option
    );


    /* Call a function to apply the transportation cities names */
    setupTransportationCitiesOptions();


    // Call the function to apply the duplicate elements functionality
    setupDuplicateOptions("duplicate_this_element_class", "invoice_company_row_div_class");


    /* Call a function to allow the user to replace the logo image */
    setupLogoImagePicker();




    /* Let the download know this invoice is ready to be stored in the inv tax DB table */
    new_or_imported_inv_company_variable = 'imported_inv_comp_company';


    /* The invoice is fully rebuilt now */
    hideInvImportLoading();
};




invCompNamesLoader.start();

let new_or_imported_inv_company_variable = 'new_invoice_company';


async function sendDataToSupabase() {



    const invNumber = document.getElementById("current_used_inv_tax_p_id")?.innerText.trim() || "";
    const guestName = document.getElementById("current_used_guest_name_p_id").innerText.trim().replace(/[()]/g, '').trim() || "";
    const revNumber = document.getElementById("current_used_rev_number_p_id")?.innerText.trim() || "";

    const formattedName = revNumber === '' ? `${invNumber} ${guestName}` : `${invNumber}${revNumber} ${guestName}`;





    /* Get the found month in the inv company data */
    const lastFoundMonthName = printLatestFullMonthName();




    /* Get the user current month na dyear to store it in the supabase for later use when deleteing data */
    const currentDate = new Date();

    const inv_company_current_user_date_options = {
        weekday: 'long',     // Optional: "Monday", "Tuesday", etc.
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true         // Use false if you prefer 24-hour format
    };
    const currentUserFullDate = currentDate.toLocaleString('en-US', inv_company_current_user_date_options);




    try {
        const { data: existingRows, error: fetchError } = await supabase
            .from('inv_tax_thai')
            .select('name')
            .eq('name', formattedName);

        const existing = existingRows && existingRows.length > 0 ? existingRows[0] : null;

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error("❌ Error checking existing:", fetchError);
            return;
        }


        if (existing) {

            /* Prepare for the storing the html content */
            const htmlContent = cleanHTML(document.getElementById("whole_invoice_company_section_id").innerHTML);


            const { data, error } = await supabase
                .from('inv_tax_thai')
                .update({
                    inv_tax_thai_content: htmlContent,
                    inv_tax_last_found_month_name: lastFoundMonthName,
                    inv_tax_user_current_date: currentUserFullDate
                })
                .eq('name', formattedName)
                .select();


            if (error) console.error("❌ Update failed:", error);
            else console.log("✅ Updated invoice content only:", data[0]);


        } else {

            /* Increase the number of the rev in case there was a value in the rev element */
            if (document.getElementById("current_used_rev_number_p_id").innerText.includes('-(')) {
                /* Set Rev in the inv number */
                let revNumValue = document.getElementById("store_supabase_current_inv_tax_rev_number_id");
                const currentStoredRev = parseInt(revNumValue.innerText, 10) || 0;
                revNumValue.innerText = `${currentStoredRev + 1}`;
            }


            /* Prepare for the storing the html content */
            const htmlContent = cleanHTML(document.getElementById("whole_invoice_company_section_id").innerHTML);


            const { data, error } = await supabase
                .from('inv_tax_thai')
                .insert([{
                    name: formattedName,
                    inv_tax_thai_content: htmlContent,
                    inv_tax_last_found_month_name: lastFoundMonthName,
                    inv_tax_user_current_date: currentUserFullDate
                }])
                .select();

            if (error) console.error("❌ Insert failed:", error);
            else console.log("✅ Inserted new invoice:", data[0]);
        }


    } catch (error) {
        console.error("🔥 Unexpected error:", error);
    }
}



// Function to clean HTML by removing unnecessary attributes and tags
function cleanHTML(html) {
    // Remove HTML comments
    html = html.replace(/<!--[\s\S]*?-->/g, '');

    // Trim excessive spaces
    return html.replace(/\s+/g, ' ').trim();
}

/* Global array holding the name of every saved inv tax (filled page by page) */
let allFetchedData = [];

/* The newest names show up right away, the older ones keep loading in the background */
const invTaxNamesLoader = createInvNamesLoader({
    tableName: 'inv_tax_thai',
    contentColumn: 'inv_tax_thai_content',
    orderColumn: 'inv_tax_user_current_date',
    containerId: 'all_supabase_stored_inv_tax_data_names_for_importing_data_div',
    namesStore: allFetchedData,
    onNameClick: (clickedName) => importContentForSelectedName(clickedName),
    /* The names dropdown is shared with the invoice companies */
    isActive: () => currentInvNamesDropdownMode === 'inv_tax'
});

// Function to import content for selected name
const importContentForSelectedName = async (clickedGoogleSheetDataName) => {
    const wholeInvoiceSection = document.getElementById("whole_invoice_company_section_id");



    if (clickedGoogleSheetDataName.style.backgroundColor === 'rgb(0, 155, 0)') {

        // Read the saved content of the selected name
        const selectedName = clickedGoogleSheetDataName.getAttribute('data-original-name') || clickedGoogleSheetDataName.innerText.trim();
        const importedContent = await invTaxNamesLoader.fetchContentForName(selectedName);

        if (!importedContent) {
            // Play a sound effect
            playSoundEffect('error');
            return;
        }

        // Play a sound effect
        playSoundEffect('success');


        /* Insert the imported data into the 'whole_invoice_company_section_id' */
        wholeInvoiceSection.innerHTML = importedContent;


        /* Hide the google sheet data */
        hideOverlay();
        /* Call a function to make all elements editable */
        makeDivContentEditable();
        // Call the function to enable the floating options functionality
        setupFloatingOptions(
            ["Bangkok", "Phuket", "Krabi", "Pattaya", "Koh Samui", "Chiang Mai"],
            "location_text_options_class",
            option => option
        );
        setupFloatingOptions(
            ["1", "2", "3", "4", "5"],
            "flight_amount_text_options_class",
            option => `${option} Person`
        );
        setupFloatingOptions(
            ["BKK-HKT\nRETURN", "BKK-HKT", "HKT-BKK"],
            "flight_destination_text_options_class",
            option => option
        );
        /* Call a function to apply the transportation cities names */
        setupTransportationCitiesOptions();
        // Call the function to apply the duplicate elements functionality
        setupDuplicateOptions("duplicate_this_element_class", "invoice_company_row_div_class");




        /* Set Today's Date */
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][today.getMonth()];
        const year = today.getFullYear();

        document.getElementById("today_inv_company_date_p_id").innerText = `Date: ${day} ${month} ${year}`;






        /* Set Rev in the inv number */
        let revNumElement = document.querySelector("#current_used_rev_number_p_id");

        revNumElement.innerText = `-(${document.getElementById("store_supabase_current_inv_tax_rev_number_id").innerText})`;




        new_or_imported_inv_company_variable = 'imported_inv_company';

    } else {

        // Reset the styles of every name, the searched out ones included (only one selected name at a time)
        invTaxNamesLoader.clearSelection();


        // Set the background color and text color of the clicked <h3> element
        clickedGoogleSheetDataName.style.backgroundColor = 'rgb(0, 155, 0)';
        clickedGoogleSheetDataName.style.color = 'white';
    }



    /* Call a function to allow the user to replace the logo image */
    setupLogoImagePicker();
};

invTaxNamesLoader.start();
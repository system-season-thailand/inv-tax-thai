

// Global array to store all fetched data
let inv_comp_indo_allFetchedData = [];

const inv_comp_indo_fetchBatchFromSupabase = async () => {
    const { data, error } = await supabase
        .from('inv_comp_thai')
        .select('*')
        .range(0, 10000);

    if (error) {
        console.error("❌ Error fetching data from Supabase:", error);
        return;
    }

    inv_comp_indo_allFetchedData = data.map(row => ({
        name: row.name?.trim(),
        content: row.inv_company_indo_content?.trim()
    }));

};

const inv_comp_indo_loadAllData = async () => {
    const container = document.getElementById("all_supabase_stored_inv_comp_indo_data_names_for_importing_data_div");

    if (!container) {
        console.error("❌ Could not find #all_supabase_stored_inv_comp_indo_data_names_for_importing_data_div");
        return;
    }

    container.innerHTML = '';

    await inv_comp_indo_fetchBatchFromSupabase(); // assumes it fills inv_comp_indo_allFetchedData globally


    const allDataSet = new Set();
    const batchHTMLElements = [];

    inv_comp_indo_allFetchedData.forEach(row => {
        if (row.name && !allDataSet.has(row.name)) {
            allDataSet.add(row.name);

            const h3 = document.createElement("h3");
            h3.textContent = row.name;

            h3.onclick = function () {
                inv_comp_indo_importContentForSelectedName(this);
            };

            batchHTMLElements.push(h3);
        }
    });

    if (batchHTMLElements.length === 0) {
        console.warn("⚠️ No unique entries found to display.");
    } else {
        // Reverse the order before appending
        batchHTMLElements.reverse().forEach(el => {
            container.appendChild(el);
        });
    }

    // Optional: trigger input filter if any
    document.querySelectorAll('.search_bar_input_class').forEach(input => {
        if (input.value.trim()) {
            let event = new Event('input', { bubbles: true });
            input.dispatchEvent(event);
        }
    });
};








// Function to import content for selected name
const inv_comp_indo_importContentForSelectedName = (clickedGoogleSheetDataName) => {

    playSoundEffect('click');

    if (clickedGoogleSheetDataName.style.backgroundColor === 'rgb(0, 155, 0)') {


        // Set the background color and text color of the clicked <h3> element
        clickedGoogleSheetDataName.style.backgroundColor = 'white';
        clickedGoogleSheetDataName.style.color = 'black';





        /* Set Today's Date */
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][today.getMonth()];
        const year = today.getFullYear();

        document.getElementById("today_inv_company_date_p_id").innerText = `Date: ${day} ${month} ${year}`;




        /* Make the value of the 'new_or_imported_inv_company_variable' to tell the system we're editing now */
        new_or_imported_inv_company_variable = 'imported_inv_company';


    } else {

        // Set the background color and text color of the clicked <h3> element
        clickedGoogleSheetDataName.style.backgroundColor = 'rgb(0, 155, 0)';
        clickedGoogleSheetDataName.style.color = 'white';
    }
};







/* Function to import the multiple inv tax (using saved inv company) */
const importMultipleSelectedInvCompIndoObjects = () => {
    const wholeInvoiceSection = document.getElementById("invoice_company_indo_storage_for_useing_iinv_tax_section_id");
    const container = document.getElementById("all_supabase_stored_inv_comp_indo_data_names_for_importing_data_div");

    const h3Elements = container.querySelectorAll("h3");

    const selectedH3s = Array.from(h3Elements).filter(h3 =>
        window.getComputedStyle(h3).backgroundColor === "rgb(0, 155, 0)"
    );


    selectedH3s.forEach(h3 => {
        const trimmedName = h3.innerText.trim();
        const matchedObject = inv_comp_indo_allFetchedData.find(obj => obj.name === trimmedName);
    
        if (matchedObject) {
            playSoundEffect('success');
    
            // Create a temporary container to parse the HTML
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = matchedObject.content;
    
            // Get the required elements
            const mainTableDiv = tempDiv.querySelector("#invoice_company_main_table_div_id");
            const guestNameP = tempDiv.querySelector("#current_used_guest_name_p_id");
            const invNumberSpan = tempDiv.querySelector("#current_used_inv_number_span_id");
    
            // Log only the required info
            if (mainTableDiv) {
                console.log("Main Table HTML:", mainTableDiv.outerHTML);
            }
            if (guestNameP) {
                console.log("Guest Name:", guestNameP.innerText.trim());
            }
            if (invNumberSpan) {
                console.log("Invoice Number:", invNumberSpan.innerText.trim());
            }
    
            // Optional: insert to DOM
            // wholeInvoiceSection.innerHTML = matchedObject.content;
    
            // Optional: further function call
            // createMultipleInvFunction();
    
        } else {
            playSoundEffect('error');
        }
    });
};






setTimeout(() => {
    inv_comp_indo_loadAllData();
}, 500);
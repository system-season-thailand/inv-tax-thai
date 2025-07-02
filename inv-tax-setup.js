

/* Page Load Header Fade Animation */
setTimeout(function () {
    document.getElementById('body').style.opacity = "1";
}, 100);






/* async function deletePastMonthRows() {
    try {
        const currentDate = new Date();
        const currentMonth = currentDate.toLocaleString('default', { month: 'long' }); // e.g., "April"

        // Month order for comparison (January = 0, December = 11)
        const monthOrder = {
            "January": 0, "February": 1, "March": 2, "April": 3, "May": 4, "June": 5,
            "July": 6, "August": 7, "September": 8, "October": 9, "November": 10, "December": 11
        };

        // Fetch all rows from Supabase
        const { data: allRows, error: fetchError } = await supabase
            .from('inv_tax_indo')
            .select('*');

        if (fetchError) throw fetchError;

        // Filter rows where the month is 6 or more months in the past
        const rowsToDelete = allRows.filter(row => {
            if (!row.package_indo_last_month_date) return false;
            
            const rowMonth = row.package_indo_last_month_date.trim(); // e.g., "January"
            const currentMonthIndex = monthOrder[currentMonth];
            const rowMonthIndex = monthOrder[rowMonth];
            
            // Calculate the difference in months considering year boundaries
            let monthDifference;
            if (rowMonthIndex <= currentMonthIndex) {
                monthDifference = currentMonthIndex - rowMonthIndex;
            } else {
                // If row month is in previous year (e.g., current is January, row is November)
                monthDifference = (12 - rowMonthIndex) + currentMonthIndex;
            }


            
            // Only delete if the row's month is 6 or more months before current month
            return rowMonthIndex !== undefined && monthDifference >= 6;
        });

        // Delete each matching row
        for (const row of rowsToDelete) {
            const { error } = await supabase
                .from('inv_tax_indo')
                .delete()
                .eq('package_indo_user_current_date', row.package_indo_user_current_date);

            if (error) console.error('Delete failed:', error);
            else console.log(`Deleted: ${row.package_indo_last_month_date}`);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

// Check if today is the 6th, 7th, or 8th before running the function
function shouldRunCleanup() {
    const today = new Date();
    const currentDay = today.getDate(); // Returns day of the month (1-31)
    return [5, 6, 7, 8, 9, 10].includes(currentDay);
}

// Execute only if today is the 5th, 6th, 7th, 8th, 9th, or 10th
if (shouldRunCleanup()) {
    deletePastMonthRows();
} */









/* Code to reload the sounds to make sure there is no latency */
let clickSoundEffect = new Audio('click.ogg');
clickSoundEffect.preload = 'auto';

let successSoundEffect = new Audio('success.ogg');
successSoundEffect.preload = 'auto';

let errorSoundEffect = new Audio('error.ogg');
errorSoundEffect.preload = 'auto';

let isSoundEffectCooldown = false; // Flag to manage cooldown

function playSoundEffect(soundName) {

    if (isSoundEffectCooldown) return; // If in cooldown, do nothing

    isSoundEffectCooldown = true; // Set cooldown
    setTimeout(() => {
        isSoundEffectCooldown = false; // Reset cooldown after 150 milliseconds
    }, 150);



    let soundEffect;

    if (soundName === 'click') {
        soundEffect = clickSoundEffect;
    } else if (soundName === 'success') {
        soundEffect = successSoundEffect;
    } else if (soundName === 'error') {
        soundEffect = errorSoundEffect;
    }

    if (soundEffect) {
        soundEffect.currentTime = 0; // Ensure the audio plays from the start
        soundEffect.play();
    }
}













/* Function to reset the value of the textarea */
deleteTextAre = function () {
    document.getElementById("dataInput").value = '';
}



/* Function to make the first letter of each word to be capital */
const toTitleCase = (str) => {
    return str
        .toLowerCase()
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};




/* Function to convert a number to Roman numeral */
function convertToRoman(num) {
    const romanNumerals = [
        "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"
    ];
    return romanNumerals[num - 1]; // Array is zero-based
}



/* Function to open choosing pdf file name box */
function openPdfDownloadBox() {
    // Check if overlay already exists
    if (document.querySelector('.black_overlay')) {
        return; // Prevent the function from running if overlay is still present
    }

    // Get the name pdf file box
    let namePdfBoxDiv = document.getElementById('name_pdf_file_div');

    // Create overlay layer
    let overlayLayer = document.createElement('div');
    overlayLayer.className = 'black_overlay';
    document.body.appendChild(overlayLayer);

    // Show overlay layer with smooth opacity transition
    setTimeout(() => {
        overlayLayer.style.opacity = '1'; // Delayed opacity transition for smooth appearance
        // Slide to the center of the screen
        namePdfBoxDiv.style.transform = 'translate(-50%, -50%)';
    }, 100);


















    if (document.getElementById("dataInput").value !== '' || new_or_imported_inv_company_variable !== 'new_invoice_company') {

        // Get all necessary values
        let invNumber = document.getElementById("current_used_inv_tax_p_id").innerText;
        let clientNameRaw = document.getElementById("current_used_guest_name_p_id").innerText;
        let clientName = clientNameRaw.replace(/[()]/g, '').trim();
        let revSpan = document.getElementById("current_used_rev_number_p_id").innerText;

        // Build PDF name
        let pdfName = `Inv Tax ${invNumber}`;
        if (revSpan) pdfName += `${revSpan}`;
        pdfName += ` ${clientName}`;

        // Set file name
        document.getElementById('pdf_file_name_input_id').value = pdfName;
    }










    /* Function to hide the name pdf file box */
    overlayLayer.onclick = function () {
        // Hide edit/delete options div
        namePdfBoxDiv.style.transform = 'translate(-50%, -100vh)';

        // Hide overlay layer with opacity transition
        overlayLayer.style.opacity = '0';

        // Remove overlay and edit/delete div from DOM after transition
        setTimeout(() => {
            document.body.removeChild(overlayLayer);

            // Now that the overlay is removed, allow the function to be triggered again
        }, 300); // Match transition duration in CSS
    };
}



















// Attach an event listener to the textarea
document.getElementById("dataInput").oninput = function () {
    processInvoiceData(`${document.getElementById("dataInput").value}`)
}




function processInvoiceData(data) {
    const rows = data.trim().split("\n");

    /* Just in case the star cell copied was gust by of company by */
    let guestBy, invoiceNo, clientName;

    if (rows[0].startsWith("GUEST BY")) {
        guestBy = rows[0].split(":")[1].trim();
        invoiceNo = rows[1].split(":")[1].trim();
        clientName = rows[2].split(":")[1].trim();
    } else {
        guestBy = rows[1].split(":")[1].trim();
        invoiceNo = rows[2].split(":")[1].trim();
        clientName = rows[3].split(":")[1].trim();
    }



    /* Get the company name that is between the () */
    let travelAgency = guestBy.match(/\(([^)]+)\)/)?.[1] || guestBy;


    // Place the values in the inv tax content
    document.getElementById('current_used_company_name_p_id').innerText = travelAgency;
    document.getElementById('current_used_inv_tax_p_id').innerText = invoiceNo;
    document.getElementById("current_used_guest_name_p_id").innerHTML = clientName;





    const parseDate = (dateStr) => {
        if (!dateStr || dateStr.trim() === "-") return "N/A";

        const months = {
            "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04",
            "Mei": "05", "Jun": "06", "Jul": "07", "Agu": "08",
            "Sep": "09", "Oct": "10", "Nov": "11", "Des": "12"
        };

        const monthReplacements = {
            "Mei": "May",
            "Agu": "Aug",
            "Des": "Dec"
        };

        const parts = dateStr.split(/[-/]/);
        if (parts.length === 2) {
            const [day, month] = parts;
            const year = "2025";

            // Get the month's name from its number, or use the original month
            let monthName = Object.keys(months).find(key => months[key] === month) || month;

            // Replace "Mei" with "May" and "Des" with "Dec" if necessary
            monthName = monthReplacements[monthName] || monthName;

            return `${day} ${monthName} ${year}`;
        }

        return dateStr;
    };


    const extractData = (lines) => {
        const hotels = [];
        let flights = null;
        let transport = null;
        let visa = null;
        let total = null;

        for (const line of lines) {
            const trimmedLine = line.trim();
            const cols = trimmedLine.split('\t').map(col => col.trim());

            // Skip header row
            if (/^NO\s+HOTEL,\s+VILLA\s+\/\s+OTHER/i.test(trimmedLine)) continue;

            // Skip rows with insufficient data unless specifically handled below
            if (cols.length < 4 && !/GUEST TRANSFER|TOTAL|TICKET|TRANSPORTATION/i.test(trimmedLine)) continue;


            // Split the input text into lines and get the last non-empty row
            const lines = data.trim().split("\n").filter(line => line.trim() !== "");
            const lastLine = lines[lines.length - 1]; // Get the last row


            // Regex to find SAR, USD, or IDR followed by a number
            const match = lastLine.match(/(SAR|USD|IDR|RP)\s*([\d.,]+)/i);





            if (match) {
                total = match[2].replace(/[.,]/g, '').trim(); // Remove commas and points and trim
            }




            // Check if any column contains "TICKET"
            if (cols.some(col => /TICK/i.test(col))) {

                const startDate = cols[4]?.trim();
                const endDate = cols[5]?.trim();
                const quantity = cols[7]?.trim();

                flights = {
                    startDate: parseDate(startDate) || "N/A",
                    endDate: parseDate(endDate) || "N/A",
                    quantity: quantity === "-" ? "2" : quantity || "2",
                };
            }






            // Handle transportation
            else if (/TRANSPORTA/i.test(cols[1] || "")) {
                // Ensure we are using the correct columns for "CHECK IN" and "CHECK OUT"
                const startDate = cols[4]?.trim() || "N/A"; // "CHECK IN" column
                const endDate = cols[5]?.trim() || "N/A";   // "CHECK OUT" column


                transport = {
                    startDate: parseDate(startDate),
                    endDate: parseDate(endDate),
                };
            }




            /* Handle visa row */
            else if (/VISA/i.test(cols[1] || "")) {
                // Ensure we are using the correct columns for "Room Type" and "Units"
                visa = {
                    visaDyasNumber: cols[1]?.trim() || "VISA", // "Room Type" column
                    personAmount: cols[7]?.trim() || "1", // "Units" column
                };
            }





            // Handle hotel rows
            else if (cols[1]) {

                let hotel = cols[1]?.trim() || "Unknown Hotel"; // "Hotel Name" column
                let hotelLocation = cols[2]?.trim(); // "Hotel Location" column
                let roomType = toTitleCase(cols[3]?.trim() || "Unknown Room"); // "Room Type" column
                let startDateRaw = cols[4]?.trim() || "N/A"; // "CHECK IN" column
                let endDateRaw = cols[5]?.trim() || "N/A"; // "CHECK OUT" column
                let unitAmount = cols[7]?.trim() || "N/A"; // "Unit Amount" column


                // Ensure "N/A" is used for missing or invalid dates
                let startDate = parseDate(startDateRaw);
                let endDate = parseDate(endDateRaw);

                const nights = parseInt(cols[6]?.trim() || "0", 10); // "No of Nights" column


                hotels.push({
                    hotel,
                    hotelLocation,
                    roomType,
                    startDate,
                    endDate,
                    nights,
                    unitAmount,
                });
            }
        }


        // Merge hotels with the same hotel name and consolidate room types
        const mergedHotels = [];
        let prevHotel = null;

        hotels.forEach((hotel) => {
            const roomTypeLower = hotel.roomType.toLowerCase();

            if (
                prevHotel &&
                prevHotel.hotel === hotel.hotel &&
                prevHotel.roomType === hotel.roomType
            ) {
                // Merge consecutive hotel entries with same name & room type
                prevHotel.nights += hotel.nights;
                prevHotel.endDate = hotel.endDate; // Update the end date
            } else if (
                prevHotel &&
                prevHotel.hotel === hotel.hotel &&
                /extra bed|decor|dinner/i.test(roomTypeLower)
            ) {
                // Append "3 Extra Bed" or "2 Decor" to the main room type
                const prefix = hotel.unitAmount && hotel.unitAmount !== "N/A" ? `${hotel.unitAmount} ` : "";
                prevHotel.roomType += ` + ${prefix}${hotel.roomType}`;
            } else if (
                prevHotel &&
                prevHotel.hotel === hotel.hotel &&
                prevHotel.endDate === hotel.endDate &&
                prevHotel.nights === hotel.nights &&
                prevHotel.checkIn === hotel.checkIn &&
                prevHotel.checkOut === hotel.checkOut
            ) {
                // Merge hotels with the same name and dates but different room types
                prevHotel.roomType += ` + ${hotel.roomType}`;
            } else {
                // Push previous hotel entry before replacing
                if (prevHotel) mergedHotels.push(prevHotel);
                prevHotel = { ...hotel };
            }
        });

        // Push the last hotel entry
        if (prevHotel) mergedHotels.push(prevHotel);


        return { hotels: mergedHotels, flights, transport, visa, total };

    };




    const lines = data.split("\n").map(line => line.trim()).filter(line => line);
    const { hotels, flights, transport, visa, total } = extractData(lines);

    document.getElementById("invoice_company_main_table_div_id").innerHTML = "";

    const mergeDates = (startDate, endDate) => {
        if (!startDate || !endDate) return "N/A";

        const now = new Date();
        const currentYear = now.getFullYear();

        const monthReplacements = {
            "Jan": "Jan", "Feb": "Feb", "Mar": "Mar", "Apr": "Apr", "Mei": "May",
            "Jun": "Jun", "Jul": "Jul", "Agu": "Aug", "Sep": "Sep", "Okt": "Oct",
            "Nov": "Nov", "Des": "Dec"
        };

        const monthNumbers = {
            "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4,
            "Jun": 5, "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9,
            "Nov": 10, "Dec": 11
        };

        const parseDateParts = (dateStr) => {
            const parts = dateStr.trim().split(" ");
            const [day, rawMonth, rawYear] = parts;
            let month = monthReplacements[rawMonth] || rawMonth;
            let year = rawYear;

            return { day, month, year };
        };

        const start = parseDateParts(startDate);
        const end = parseDateParts(endDate);

        // Auto-assign missing years intelligently
        if (!start.year && !end.year) {
            start.year = currentYear.toString();

            const startMonthIndex = monthNumbers[start.month];
            const endMonthIndex = monthNumbers[end.month];

            if (startMonthIndex > endMonthIndex) {
                end.year = (currentYear + 1).toString();
            } else {
                end.year = currentYear.toString();
            }
        } else if (!start.year) {
            const endYearNum = parseInt(end.year, 10);
            const startMonthIndex = monthNumbers[start.month];
            const endMonthIndex = monthNumbers[end.month];
            start.year = (startMonthIndex > endMonthIndex ? endYearNum - 1 : endYearNum).toString();
        } else if (!end.year) {
            const startYearNum = parseInt(start.year, 10);
            const startMonthIndex = monthNumbers[start.month];
            const endMonthIndex = monthNumbers[end.month];
            end.year = (startMonthIndex > endMonthIndex ? startYearNum + 1 : startYearNum).toString();
        }

        // Final display
        if (start.year === end.year && start.month === end.month) {
            return `${start.day} - ${end.day} ${start.month} ${start.year}`;
        }

        if (start.year === end.year) {
            return `${start.day} ${start.month} - ${end.day} ${end.month} ${start.year}`;
        }

        return `${start.day} ${start.month} ${start.year} - ${end.day} ${end.month} ${end.year}`;
    };



    function fixHotelDateYears() {
        const rows = document.querySelectorAll('.invoice_company_row_div_class');
        let lastCheckOutDate = null;

        rows.forEach(row => {
            const dateP = row.querySelector('.hotel_check_in_out_date_class');
            if (!dateP) return;

            let dateText = dateP.innerText.trim(); // e.g. "1 - 8 Jan 2025"
            let checkInDate, checkOutDate;

            // Match formats like "8 Dec 2025 - 1 Jan 2026" OR "1 - 8 Jan 2025"
            const regexFull = /^(\d{1,2}) (\w{3}) (\d{4}) - (\d{1,2}) (\w{3}) (\d{4})$/;
            const regexPartial = /^(\d{1,2}) - (\d{1,2}) (\w{3}) (\d{4})$/;

            if (regexFull.test(dateText)) {
                // Already fully formed, just update tracking
                const [, d1, m1, y1, d2, m2, y2] = regexFull.exec(dateText);
                checkInDate = new Date(`${m1} ${d1}, ${y1}`);
                checkOutDate = new Date(`${m2} ${d2}, ${y2}`);
            } else if (regexPartial.test(dateText)) {
                // Incomplete, like "1 - 8 Jan 2025"
                const [, d1, d2, month, year] = regexPartial.exec(dateText);
                let inferredYear = parseInt(year);

                // Try to infer based on previous check-out
                if (lastCheckOutDate && new Date(`${month} ${d1}, ${year}`) < lastCheckOutDate) {
                    inferredYear += 1; // Move to next year
                }

                checkInDate = new Date(`${month} ${d1}, ${inferredYear}`);
                checkOutDate = new Date(`${month} ${d2}, ${inferredYear}`);

                // Update the text to include corrected year
                dateP.innerText = `${d1} - ${d2} ${month} ${inferredYear}`;
            }

            if (checkOutDate) {
                lastCheckOutDate = checkOutDate;
            }
        });
    }






    const createHotelRows = (data) => {
        const allHotelsDiv = document.createElement("div");
        allHotelsDiv.id = "all_hotels_rows_div_id";

        data.forEach(item => {
            const mergedDate = mergeDates(item.startDate, item.endDate);

            // Check if unitAmount is more than 1 and append to roomType
            let roomTypeDisplay = item.roomType;
            if (parseInt(item.unitAmount, 10) > 1) {
                roomTypeDisplay = `(${item.unitAmount} Units) ${roomTypeDisplay}`;
            }


            const rowDiv = document.createElement("div");
            rowDiv.className = "invoice_company_row_div_class";
            rowDiv.innerHTML = `
                <div>
                    <p class="hotel_check_in_out_date_class">${mergedDate}</p>
                </div>
                <div style="padding: 20px 0">
                    <p class="duplicate_this_element_class">${item.hotel.toUpperCase()}</p>
                    <p class="duplicate_this_element_class">${roomTypeDisplay}</p>
                </div>
                <div>
                    <p class="hotel_location_value_class location_text_options_class">${item.hotelLocation}</p>
                </div>
                <div style="border-right: 0.5px solid black;">
                    <p>${item.nights} Night${item.nights > 1 ? "s" : ""}</p>
                </div>`;

            allHotelsDiv.appendChild(rowDiv);
        });

        document.getElementById("invoice_company_main_table_div_id").appendChild(allHotelsDiv);
    };





    const getFlightDates = () => {
        const hotelRows = document.querySelectorAll(".invoice_company_row_div_class");

        let locations = [];
        let checkOutDates = [];

        hotelRows.forEach(row => {
            const location = row.querySelector(".hotel_location_value_class")?.innerText.trim();
            const dateRange = row.querySelector(".hotel_check_in_out_date_class")?.innerText.trim();

            if (location && dateRange) {
                const [_, checkOutDate] = dateRange.split(" - "); // Extract checkout date

                // Normalize specific cities to "Bangkok"
                const normalizedLocation = ["Pattaya"].includes(location) ? "Bangkok" : location;

                locations.push(normalizedLocation);
                checkOutDates.push(checkOutDate);
            }
        });

        let firstFlightDate = null;
        let lastFlightDate = null;

        for (let i = 0; i < locations.length - 1; i++) {
            if (locations[i] === "Bangkok" && locations[i + 1] !== "Bangkok") {
                firstFlightDate = checkOutDates[i]; // Leaving Bangkok
            }
            if (locations[i] !== "Bangkok" && locations[i + 1] === "Bangkok") {
                lastFlightDate = checkOutDates[i]; // Returning to Bangkok
            }
        }

        // If no flight out of Bangkok is found, return N/A
        if (!firstFlightDate && lastFlightDate) {
            const [day, month, year] = lastFlightDate.split(" ");
            return `${day} ${month} ${year}`;
        }
        if (!firstFlightDate) {
            return "N/A";
        }

        const [firstDay, firstMonth, firstYear] = firstFlightDate.split(" ");

        if (!lastFlightDate) {
            return `${firstDay} ${firstMonth} ${firstYear}`; // Only firstFlightDate exists
        }

        const [lastDay, lastMonth, lastYear] = lastFlightDate.split(" ");

        if (firstYear === lastYear) {
            if (firstMonth === lastMonth) {
                return `${firstDay} - ${lastDay} ${firstMonth} ${firstYear}`; // Same month
            }
            return `${firstDay} ${firstMonth} - ${lastDay} ${lastMonth} ${firstYear}`; // Different month
        } else {
            return `${firstDay} ${firstMonth} ${firstYear} - ${lastDay} ${lastMonth} ${lastYear}`; // Different year
        }
    };




    const getFlightDestination = () => {
        const hotelLocationElements = document.querySelectorAll(".hotel_location_value_class");
        let locations = Array.from(hotelLocationElements).map(el => el.innerText.trim());

        // Normalize specific cities to "Jakarta"
        locations = locations.map(loc =>
            ["Pattaya"].includes(loc) ? "Bangkok" : loc
        );

        // Convert city names to airport codes
        const cityToAirport = {
            "Bangkok": "BKK",
            "Phuket": "HKT",
            "Krabi": "KBV",
            "Chiang Mai": "CNX"
        };

        let airportCodes = locations.map(loc => cityToAirport[loc] || loc);

        // Construct the flight destination string for every transition
        let flightDestinations = [];
        for (let i = 0; i < airportCodes.length - 1; i++) {
            if (airportCodes[i] !== airportCodes[i + 1]) {
                flightDestinations.push(`${airportCodes[i]}-${airportCodes[i + 1]}`);
            }
        }

        return flightDestinations.join("<br>");
    };

    const parseIndoMonthToEnglish = (month) => {
        const monthMap = {
            "Januari": "January",
            "Februari": "February",
            "Maret": "March",
            "April": "April",
            "Mei": "May",
            "Juni": "June",
            "Juli": "July",
            "Agustus": "August",
            "September": "September",
            "Oktober": "October",
            "November": "November",
            "Desember": "December"
        };
        return monthMap[month] || month;
    };

    const formatDateRange = (start, end, fallbackYear = "2025") => {
        if (!start || !end) return "N/A";

        const [startDay, startMonthIndo] = start.split(" ");
        const [endDay, endMonthIndo] = end.split(" ");

        const startMonth = parseIndoMonthToEnglish(startMonthIndo);
        const endMonth = parseIndoMonthToEnglish(endMonthIndo || startMonthIndo);

        if (startMonth === endMonth) {
            return `${startDay} - ${endDay} ${startMonth} ${fallbackYear}`;
        } else {
            return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${fallbackYear}`;
        }
    };

    const createFlightRow = (data) => {
        if (!data) return;

        // FIX THE HOTEL DATES FIRST!
        fixHotelDateYears(); // <<< ADD THIS LINE

        const flightDiv = document.createElement("div");
        flightDiv.id = "flight_tickets_row_div_id";

        // Generate the flight dates dynamically
        let flightDates = getFlightDates();

        // If dynamic dates are "N/A", use startDate and endDate from `data`
        if (flightDates === "N/A" && data.startDate && data.endDate) {
            flightDates = formatDateRange(data.startDate, data.endDate);
        }


        let getFlightDestinationText = getFlightDestination();
        if (getFlightDestinationText === '') {
            getFlightDestinationText = '<span class="flight_destination_text_options_class red_text_color_class">N/A</span>'
        }



        const rowDiv = document.createElement("div");
        rowDiv.className = "invoice_company_row_div_class";

        rowDiv.innerHTML = `
            <div>
                <p contenteditable="true">${flightDates}</p>
            </div>
            <div>
                <p class="duplicate_this_element_class" contenteditable="true" style="padding: 25px 0">Domestic Flight Tickets</p>
            </div>
            <div>
                <p contenteditable="true">${getFlightDestinationText}</p>
            </div>
            <div style="border-right: 0.5px solid black;">
                <p class="red_text_color_class flight_amount_text_options_class" contenteditable="true">${data.quantity} Person</p>  
            </div>`;

        flightDiv.appendChild(rowDiv);
        document.getElementById("invoice_company_main_table_div_id").appendChild(flightDiv);
    };






    const createTransportationRow = (data) => {
        if (!data) return;


        // ✅ Ensure hotel check-in/out dates are standardized
        fixHotelDateYears();


        const transportDiv = document.createElement("div");
        transportDiv.id = "transportation_row_div_id";

        const allHotelLocations = Array.from(document.querySelectorAll(".hotel_location_value_class"))
            .map(p => p.innerText.trim())
            .filter(text => text !== "");

        const uniqueHotelLocations = [...new Set(allHotelLocations)];

        const allHotelLocationsSeparatedByComma = uniqueHotelLocations.length > 0
            ? uniqueHotelLocations.join(", ")
            : '<span class="transportation_cities_text_options_class red_text_color_class">N/A</span>';

        const defaultYear = 2025;

        const monthReplacements = {
            "Mei": "May",
            "Agu": "Aug",
            "Okt": "Oct",
            "Des": "Dec"
        };

        const fixMonth = (month) => monthReplacements[month] || month;

        const parseDateParts = (dateStr) => {
            if (!dateStr) return null;
            const [day, monthRaw, yearRaw] = dateStr.trim().split(" ");
            const month = fixMonth(monthRaw);
            const year = yearRaw ? parseInt(yearRaw) : null;
            return { day, month, year };
        };

        const start = parseDateParts(data.startDate);
        const end = parseDateParts(data.endDate);

        if (!start || !end) return;

        let startYear = start.year ?? defaultYear;
        let endYear = end.year;

        // 🔄 Infer end year if missing
        if (!endYear) {
            const tempStartDate = new Date(`${start.month} ${start.day}, ${startYear}`);
            const tempEndDate = new Date(`${end.month} ${end.day}, ${startYear}`);
            endYear = tempEndDate < tempStartDate ? startYear + 1 : startYear;
        }


        const startDateObj = new Date(`${start.month} ${start.day}, ${startYear}`);
        const endDateObj = new Date(`${end.month} ${end.day}, ${endYear}`);
        const durationDays = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)) + 1;

        let mergedDates;
        if (startYear !== endYear) {
            mergedDates = `${start.day} ${start.month} ${startYear} - ${end.day} ${end.month} ${endYear}`;
        } else if (start.month !== end.month) {
            mergedDates = `${start.day} ${start.month} - ${end.day} ${end.month} ${startYear}`;
        } else {
            mergedDates = `${start.day} - ${end.day} ${start.month} ${startYear}`;
        }

        const rowDiv = document.createElement("div");
        rowDiv.className = "invoice_company_row_div_class";
        rowDiv.innerHTML = `
        <div>
            <p>${mergedDates}</p>
        </div>
        <div>
            <p class="duplicate_this_element_class" style="padding: 25px 0">TRANSPORTATION + SIM CARD</p>
        </div>
        <div>
            <p class="transportation_cities_text_options_class">${allHotelLocationsSeparatedByComma}</p>
        </div>
        <div style="border-right: 0.5px solid black;">
            <p>${durationDays} Days</p> 
        </div>`;

        transportDiv.appendChild(rowDiv);
        document.getElementById("invoice_company_main_table_div_id").appendChild(transportDiv);
    };






    const createVisaRow = (data) => {
        if (!data) return;

        const visaDiv = document.createElement("div");
        visaDiv.id = "visa_row_div_id";

        const rowDiv = document.createElement("div");
        rowDiv.className = "invoice_company_row_div_class";

        // Add all flight dates as <p> elements
        rowDiv.innerHTML = `
            <div>
                <p contenteditable="true">${new Date().getFullYear()}</p>
            </div>
            <div>
                <p class="duplicate_this_element_class" contenteditable="true" style="padding: 25px 0">${data.visaDyasNumber}</p>
            </div>
            <div>
                <p contenteditable="true">THAILAND</p>
            </div>
            <div style="border-right: 0.5px solid black;">
                <p class="red_text_color_class flight_amount_text_options_class" contenteditable="true">${data.personAmount} Person</p>  
            </div>`;

        visaDiv.appendChild(rowDiv);
        document.getElementById("invoice_company_main_table_div_id").appendChild(visaDiv);
    };






    const createTotalPriceRow = (total) => {
        const totalDiv = document.createElement("div");
        totalDiv.id = "total_price_row_div_id";





        // Format total number with commas (after minus 20 from the number as the tax)
        let tax = 0;
        if (total > 7000) {
            tax = 50;
        } else if (total >= 4000 && total <= 7000) {
            tax = 40;
        } else {
            tax = 25;
        }
        const formattedTotal = Number(total - tax).toLocaleString();





        const rowDiv = document.createElement("div");
        rowDiv.className = "invoice_company_row_div_class last_invoice_company_row_div_class";
        rowDiv.innerHTML = `
            <div>
                <p class="duplicate_this_element_class">TOTAL</p>
            </div>
            <div id="inv_tax_total_price_div_id" style="border-right: 0.5px solid black;">
                <p style="padding: 5px 0">SAR&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${formattedTotal}</p>
            </div>
        `;

        totalDiv.appendChild(rowDiv);
        document.getElementById("invoice_company_main_table_div_id").appendChild(totalDiv);
    };




    createHotelRows(hotels);
    if (flights) createFlightRow(flights);
    if (transport) createTransportationRow(transport);
    if (visa) createVisaRow(visa);
    if (total) createTotalPriceRow(total);



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



    /* Call a function to correct the hotels dates */
    fixHotelDateYears();


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
}













/* Function to make all elements innerText editable */
makeDivContentEditable = function () {
    const parentDiv = document.getElementById('whole_invoice_company_section_id');
    const childElements = parentDiv.querySelectorAll("p, pre");

    childElements.forEach(element => {
        element.setAttribute('contenteditable', true);

        element.addEventListener("focus", () => {
            element.style.outline = "none";
            element.style.border = "none";
        });

        element.addEventListener("blur", () => {
            element.style.outline = "";
            element.style.border = "";
        });

        element.addEventListener("input", () => {
            if (element.classList.contains("red_text_color_class")) {
                element.style.color = "black";
            }
        });

        element.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();

                const br = document.createElement("br");

                const selection = window.getSelection();
                const range = selection.getRangeAt(0);
                range.deleteContents(); // remove selected text if any
                range.insertNode(br);

                // Move caret after the <br>
                range.setStartAfter(br);
                range.setEndAfter(br);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        });
    });
};























let activeMenu = null; // Keeps track of the currently visible menu

/* Floating Options */
function setupFloatingOptions(options, targetClass, formatOption) {
    const colors = ["darkorange", "darkred", "darkblue", "darkgreen", "gray"]; // Array of dark background colors

    // Create the floating options menu
    const optionsMenu = document.createElement("div");
    optionsMenu.style.position = "absolute";
    optionsMenu.style.display = "none"; // Hide by default
    optionsMenu.style.zIndex = "1000";
    optionsMenu.style.background = "#fff";
    optionsMenu.style.border = "1px solid #ccc";
    optionsMenu.style.padding = "10px";
    optionsMenu.style.borderRadius = "5px";
    optionsMenu.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    optionsMenu.style.flexDirection = "row"; // Explicitly set row layout
    optionsMenu.style.gap = "10px"; // Add spacing between options
    optionsMenu.style.alignItems = "center"; // Align items vertically in the center

    // Add options to the menu
    options.forEach((optionText, index) => {
        const option = document.createElement("div");
        option.innerText = optionText;
        option.style.cursor = "pointer";
        option.style.padding = "8px 15px"; // Adjusted padding for readability
        option.style.textAlign = "center";
        option.style.fontSize = "1rem"; // Smaller font for compactness
        option.style.color = "#ffffff"; // White text color
        option.style.backgroundColor = colors[index % colors.length]; // Rotate through dark background colors
        option.style.borderRadius = "3px"; // Slight rounding for aesthetics
        option.style.whiteSpace = "nowrap"; // Prevent text from wrapping
        option.style.display = "inline-flex"; // Ensure options behave as inline-flex
        option.style.margin = "0 5px"; // Add small margin on left and right

        // Add click event to set the innerText of the clicked element
        option.addEventListener("click", () => {
            currentElement.innerText = formatOption(optionText);
            currentElement.style.color = "black";
            optionsMenu.style.display = "none"; // Hide the menu
            activeMenu = null; // Clear the active menu
        });

        optionsMenu.appendChild(option);
    });

    // Remove last border
    if (optionsMenu.lastChild) {
        optionsMenu.lastChild.style.borderBottom = "none";
    }

    // Append the menu to the document
    document.body.appendChild(optionsMenu);

    let currentElement = null;

    // Add event listener to all elements with the target class
    document.querySelectorAll(`.${targetClass}`).forEach(element => {
        element.addEventListener("click", (e) => {
            // Hide the currently active menu if it exists
            if (activeMenu) activeMenu.style.display = "none";

            // Store the clicked element
            currentElement = e.target;

            // Position the menu near the clicked element
            const rect = currentElement.getBoundingClientRect();
            optionsMenu.style.left = `${rect.left}px`;
            optionsMenu.style.top = `${rect.bottom + window.scrollY}px`;

            // Show the menu
            optionsMenu.style.display = "block";
            activeMenu = optionsMenu; // Set the active menu

            // Prevent event propagation to avoid hiding the menu immediately
            e.stopPropagation();
        });
    });

    // Hide the menu when clicking outside
    document.addEventListener("click", (e) => {
        if (!optionsMenu.contains(e.target) && !e.target.classList.contains(targetClass)) {
            optionsMenu.style.display = "none";
            activeMenu = null; // Clear the active menu
        }
    });
}














/* Transpotation Cities Options */
function setupTransportationCitiesOptions() {
    // Define the flight amount options
    const FlightDestinations = ["Bangkok", "Phuket", "Krabi", "Pattaya", "Koh Samui", "Chiang Mai"];
    const colors = ["darkorange", "darkred", "darkblue", "darkgreen", "gray"]; // Array of dark background colors

    // Create the floating options menu
    const optionsMenu = document.createElement("div");
    optionsMenu.style.position = "absolute";
    optionsMenu.style.display = "none"; // Hide by default
    optionsMenu.style.zIndex = "1000";
    optionsMenu.style.background = "#fff";
    optionsMenu.style.border = "1px solid #ccc";
    optionsMenu.style.padding = "10px";
    optionsMenu.style.borderRadius = "5px";
    optionsMenu.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    optionsMenu.style.flexDirection = "row"; // Explicitly set row layout
    optionsMenu.style.gap = "10px"; // Add spacing between options
    optionsMenu.style.alignItems = "center"; // Align items vertically in the center



    // Add flight amount options to the menu
    FlightDestinations.forEach((FlightDestination, index) => {
        const option = document.createElement("div");
        option.innerText = FlightDestination;
        option.style.cursor = "pointer";
        option.style.padding = "8px 15px"; // Adjusted padding for readability
        option.style.textAlign = "center";
        option.style.fontSize = "1rem"; // Smaller font for compactness
        option.style.color = "#ffffff"; // White text color
        option.style.backgroundColor = colors[index % colors.length]; // Rotate through dark background colors
        option.style.borderRadius = "3px"; // Slight rounding for aesthetics
        option.style.whiteSpace = "nowrap"; // Prevent text from wrapping
        option.style.display = "inline-flex"; // Ensure options behave as inline-flex
        option.style.margin = "0 5px"; // Add small margin on left and right


        // Add click event to set the innerText of the clicked p element
        option.addEventListener("click", () => {
            if (currentElement) {
                let currentText = currentElement.innerText.trim();

                // Normalize city names for comparison (case-insensitive)
                const selectedCity = FlightDestination.trim();
                const currentCities = currentText.split(",").map(city => city.trim().toLowerCase());

                // If the city already exists, do nothing
                if (currentCities.includes(selectedCity.toLowerCase())) {
                    return;
                }

                // If current text is 'Location' or 'N/A', replace with selected city
                if (currentText === 'Location' || currentText === 'N/A') {
                    currentElement.innerText = selectedCity;
                } else {
                    currentElement.innerText = `${currentText}, ${selectedCity}`;
                }

                // Set text color to black
                currentElement.style.color = 'black';
            }
        });



        optionsMenu.appendChild(option);
    });

    // Remove last border
    if (optionsMenu.lastChild) {
        optionsMenu.lastChild.style.borderBottom = "none";
    }

    // Append the menu to the document
    document.body.appendChild(optionsMenu);

    let currentElement = null;

    // Add event listener to all p elements with the target class
    document.querySelectorAll(".transportation_cities_text_options_class").forEach(p => {
        p.addEventListener("click", (e) => {
            // Store the clicked element
            currentElement = e.target;

            // Position the menu near the clicked element
            const rect = currentElement.getBoundingClientRect();
            optionsMenu.style.left = `${rect.left}px`;
            optionsMenu.style.top = `${rect.bottom + window.scrollY}px`;

            // Show the menu
            optionsMenu.style.display = "block";
        });
    });

    // Hide the menu when clicking outside
    document.addEventListener("click", (e) => {
        if (!optionsMenu.contains(e.target) && !e.target.classList.contains("transportation_cities_text_options_class")) {
            optionsMenu.style.display = "none";
        }
    });
}





















/* Function to duplicate the clicked row */
function setupDuplicateOptions(targetClass, parentClass) {
    // Create the floating options menu
    const optionsMenu = document.createElement("div");
    optionsMenu.style.position = "absolute";
    optionsMenu.style.display = "none"; // Hide by default
    optionsMenu.style.zIndex = "1000";
    optionsMenu.style.background = "#fff";
    optionsMenu.style.border = "1px solid #ccc";
    optionsMenu.style.padding = "10px";
    optionsMenu.style.borderRadius = "5px";
    optionsMenu.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    optionsMenu.style.flexDirection = "row"; // Explicitly set row layout
    optionsMenu.style.gap = "10px"; // Add spacing between options
    optionsMenu.style.alignItems = "center"; // Align items vertically in the center

    const copyUpOption = document.createElement("div");
    copyUpOption.innerText = "Copy Up";
    copyUpOption.style.cursor = "pointer";
    copyUpOption.style.padding = "8px 10px";
    copyUpOption.style.textAlign = "center";
    copyUpOption.style.borderBottom = "1px solid #eee";
    copyUpOption.style.fontSize = "1.2rem";
    copyUpOption.style.color = "#ffffff";
    copyUpOption.style.backgroundColor = "darkblue";
    copyUpOption.style.borderRadius = "3px";
    copyUpOption.style.whiteSpace = "nowrap"; // Prevent text from wrapping
    copyUpOption.style.display = "inline-flex"; // Ensure options behave as inline-flex
    copyUpOption.style.margin = "0 5px"; // Add small margin on left and right

    const copyDownOption = document.createElement("div");
    copyDownOption.innerText = "Copy Down";
    copyDownOption.style.cursor = "pointer";
    copyDownOption.style.padding = "8px 10px";
    copyDownOption.style.textAlign = "center";
    copyDownOption.style.fontSize = "1.2rem";
    copyDownOption.style.color = "#ffffff";
    copyDownOption.style.backgroundColor = "darkgreen";
    copyDownOption.style.borderRadius = "3px";
    copyDownOption.style.whiteSpace = "nowrap"; // Prevent text from wrapping
    copyDownOption.style.display = "inline-flex"; // Ensure options behave as inline-flex
    copyDownOption.style.margin = "0 5px"; // Add small margin on left and right

    const deleteDivOption = document.createElement("div");
    deleteDivOption.innerText = "Delete";
    deleteDivOption.style.cursor = "pointer";
    deleteDivOption.style.padding = "8px 10px";
    deleteDivOption.style.textAlign = "center";
    deleteDivOption.style.fontSize = "1.2rem";
    deleteDivOption.style.color = "#ffffff";
    deleteDivOption.style.backgroundColor = "darkred"; // Use red for delete
    deleteDivOption.style.borderRadius = "3px";
    deleteDivOption.style.whiteSpace = "nowrap";
    deleteDivOption.style.display = "inline-flex";
    deleteDivOption.style.margin = "0 5px";

    optionsMenu.appendChild(copyUpOption);
    optionsMenu.appendChild(copyDownOption);
    optionsMenu.appendChild(deleteDivOption);
    document.body.appendChild(optionsMenu);

    let currentElement = null;

    document.querySelectorAll(`.${targetClass}`).forEach(element => {
        element.addEventListener("click", (e) => {
            if (activeMenu) activeMenu.style.display = "none";

            currentElement = e.target;

            const rect = currentElement.getBoundingClientRect();
            optionsMenu.style.left = `${rect.left}px`;
            optionsMenu.style.top = `${rect.bottom + window.scrollY}px`;

            optionsMenu.style.display = "block";
            activeMenu = optionsMenu;

            e.stopPropagation();
        });
    });

    document.addEventListener("click", (e) => {
        if (!optionsMenu.contains(e.target) && !e.target.classList.contains(targetClass)) {
            optionsMenu.style.display = "none";
            activeMenu = null;
        }
    });

    copyUpOption.addEventListener("click", () => {
        if (currentElement) {
            const parentDiv = currentElement.closest(`.${parentClass}`);
            if (parentDiv) {
                const clone = parentDiv.cloneNode(true);
                parentDiv.parentNode.insertBefore(clone, parentDiv);
            }
            optionsMenu.style.display = "none";
            activeMenu = null;

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

        }
    });

    copyDownOption.addEventListener("click", () => {
        if (currentElement) {
            const parentDiv = currentElement.closest(`.${parentClass}`);
            if (parentDiv) {
                const clone = parentDiv.cloneNode(true);
                parentDiv.parentNode.insertBefore(clone, parentDiv.nextSibling);
            }
            optionsMenu.style.display = "none";
            activeMenu = null;

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

        }
    });




    deleteDivOption.addEventListener("click", () => {
        if (currentElement) {
            const parentDiv = currentElement.closest(`.${parentClass}`); // Find the parent div
            if (parentDiv) {
                parentDiv.remove(); // Remove it from the DOM

                optionsMenu.style.display = "none";
                activeMenu = null;


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
            }
        }
    });
}

























// Praper the overlay layer variable
let overlayLayer = null;

// Function to show the overlay
function showOverlay(clickedInputDropdownIdName) {

    // Disable scrolling
    document.documentElement.style.overflow = 'hidden';


    let clickedInputDropdown = document.getElementById(clickedInputDropdownIdName);

    // Store the reference to the last clicked input field
    lastClickedClintMovementsCityInput = document.getElementById(event.target.id);
    clickedInputDropdown.classList.add('show'); // Show the clicked input dropdown
    clickedInputDropdown.style.transition = 'transform 0.2s ease-in-out'; // Ensure transform transition is smooth

    overlayLayer = document.createElement('div'); // Create a new overlay element
    overlayLayer.className = 'black_overlay'; // Set the class name for styling
    overlayLayer.onclick = hideOverlay; // Set the click event listener to hide the overlay when clicked outside
    document.body.appendChild(overlayLayer); // Append overlay to the document body

    setTimeout(() => {
        overlayLayer.style.opacity = '1'; // Delayed opacity transition for smooth appearance
    }, 50);
}

// Function to hide the overlay and any visible dropdown
function hideOverlay() {

    // Re-enable scrolling
    document.documentElement.style.overflow = 'auto';


    // Check if any dropdown with the class name 'searchable_names_dropdown_class' is visible and hide it
    let visibleDropdown_1 = document.querySelector('.searchable_names_dropdown_class.show');
    if (visibleDropdown_1) {
        visibleDropdown_1.classList.remove('show'); // Remove 'show' class to hide dropdown
    }


    // Reset all 'searchable_names_dropdown_class' elements back to their default styling
    let dropdownDivElements = document.querySelectorAll('.searchable_names_dropdown_class');
    dropdownDivElements.forEach(dropdown => {
        dropdown.style.maxHeight = ''; // Reset maxHeight to default
        dropdown.style.minHeight = ''; // Reset minHeight to default
        dropdown.style.transition = ''; // Reset transition to default
    });

    // Hide the overlay if it exists
    if (overlayLayer) {
        overlayLayer.style.opacity = '0'; // Set opacity to 0 for smooth disappearance

        setTimeout(() => {
            if (overlayLayer) {
                document.body.removeChild(overlayLayer); // Remove overlay from DOM
                overlayLayer = null; // Reset overlay variable
            }
        }, 200); // Assuming 200ms is the duration of your opacity transition
    }
}











// Select all elements with the class 'search_bar_input_class'
let searchBarInputElements = document.querySelectorAll('.search_bar_input_class');

// Add event listeners to each search bar input element
searchBarInputElements.forEach(input => {

    // Add a click event listener to the input element
    input.addEventListener('click', () => {
        // Find the closest parent element with the class 'searchable_names_dropdown_class'
        let dropdownDiv = input.closest('.searchable_names_dropdown_class');

        // Set a smooth transition for the height property
        dropdownDiv.style.transition = 'height 0.1s ease-in-out';

        // Set the height of the dropdown div to 70vh when the search bar is clicked
        dropdownDiv.style.maxHeight = '70vh';
        dropdownDiv.style.minHeight = '70vh';
    });

    // Add an input event listener to the input element
    input.addEventListener('input', () => {
        // Get the trimmed and lowercased value of the input element
        let filter = input.value.trim().toLowerCase();

        // Split the input value into words for better matching
        let filterWords = filter.split(/\s+/); // Split by any whitespace

        // Find the closest parent element with the class 'searchable_names_dropdown_class'
        let dropdownDiv = input.closest('.searchable_names_dropdown_class');

        // Select all <h3> elements within the same dropdown div
        let options = dropdownDiv.querySelectorAll('h3');

        // Function to count occurrences of a word in a string
        let countOccurrences = (text, word) => {
            return text.split(word).length - 1;
        };

        // Initialize a counter for the number of visible options
        let visibleCount = 0;

        // Loop through each option in the dropdown
        options.forEach(option => {
            // Get the trimmed and lowercased text content of the option
            let optionText = option.textContent.trim().toLowerCase();

            // Check if all filter words are present in the option text with the same or more occurrences
            let matches = filterWords.every(word => {
                // Count occurrences of the word in the input and in the option text
                let inputWordCount = countOccurrences(filter, word);
                let optionWordCount = countOccurrences(optionText, word);

                // The word in the option text must appear at least as many times as in the input
                return optionWordCount >= inputWordCount;
            });

            // If the filter is empty and less than 6 options are visible, show the option
            if (filter === '' && visibleCount < 6) {
                option.style.display = 'block'; // Display the option
                visibleCount++; // Increment the visible options count
            }
            // If the option text includes all words from the filter with the correct occurrence count, show the option
            else if (matches) {
                option.style.display = 'block'; // Display the option
            }
            // Otherwise, hide the option
            else {
                option.style.display = 'none'; // Hide the option
            }
        });
    });
});
















/* Download the PDF file */
async function checkThePdfNameToDownload() {

    if (document.getElementById("current_used_guest_name_p_id").innerText !== '' && document.getElementById("current_used_inv_tax_p_id")?.innerText !== '') {

        // Play a sound effect
        playSoundEffect('success');


        /* Run a function to store the data in the google sheet */
        sendDataToSupabase()



        // Disable the button while processing
        const button = document.getElementById('check_pdf_name_button');
        button.style.pointerEvents = 'none';
        button.style.backgroundColor = 'gray';
        button.innerText = 'Great!';

        // Target all elements with the red text class
        const redTextElements = document.querySelectorAll('.red_text_color_class');

        // Store the original color and set the text color to black
        redTextElements.forEach(element => {
            element.dataset.originalColor = element.style.color; // Save original color
            element.style.color = 'black'; // Change to black for PDF
        });









        // Capture the div by ID
        const element = document.getElementById("whole_invoice_company_section_id");

        html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
        }).then(canvas => {
            const imgData = canvas.toDataURL("image/jpeg", 0.95);

            const imgWidthPx = canvas.width;
            const imgHeightPx = canvas.height;

            const pdfWidthMm = 210;      // A4 width
            const a4HeightMm = 297;      // A4 height
            const bottomPaddingMm = 10;  // Padding for tall content

            const pxPerMm = imgWidthPx / pdfWidthMm;
            const contentHeightMm = imgHeightPx / pxPerMm;

            // Add bottom padding only if height exceeds standard A4 height
            const pdfHeightMm = contentHeightMm > a4HeightMm
                ? contentHeightMm + bottomPaddingMm
                : a4HeightMm;

            const pdf = new jspdf.jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: [pdfWidthMm, pdfHeightMm]
            });

            // Position image at top-left, scaled to full width
            pdf.addImage(imgData, "JPEG", 0, 0, pdfWidthMm, contentHeightMm);

            const fileName = document.getElementById('pdf_file_name_input_id').value || "invoice";
            pdf.save(`${fileName}.pdf`);
        });




















        // Restore original red color after download
        redTextElements.forEach(element => {
            element.style.color = element.dataset.originalColor || 'red';
        });











    } else {
        // Play a sound effect
        playSoundEffect('error');

        const button = document.getElementById('check_pdf_name_button');

        // Change background to red gradient
        button.style.background = 'rgb(125, 46, 46)';

        setTimeout(() => {
            // Change background back to green gradient after 1 second
            button.style.background = '#4CAF50';
        }, 500);

    }
}










const printLatestFullMonthName = () => {
    const div = document.getElementById("invoice_company_main_table_div_id");
    if (!div) {
        console.warn("Div not found");
        return;
    }

    const text = div.innerText;

    const monthReplacements = {
        "Jan": "Jan", "Feb": "Feb", "Mar": "Mar", "Apr": "Apr",
        "Mei": "May", "May": "May", "Jun": "Jun", "Jul": "Jul",
        "Agu": "Aug", "Aug": "Aug", "Sep": "Sep", "Okt": "Oct",
        "Oct": "Oct", "Nov": "Nov", "Des": "Dec", "Dec": "Dec"
    };

    const datePattern = /(\d{1,2}) (\w{3}) (\d{4})|(\d{1,2}) - (\d{1,2}) (\w{3}) (\d{4})|(\d{1,2}) (\w{3}) - (\d{1,2}) (\w{3}) (\d{4})/g;

    let match;
    let latestDate = null;

    while ((match = datePattern.exec(text)) !== null) {
        let day, month, year;

        if (match[1] && match[2] && match[3]) {
            // Format: "21 Jan 2026"
            day = match[1];
            month = monthReplacements[match[2]] || match[2];
            year = match[3];
        } else if (match[4] && match[5] && match[6] && match[7]) {
            // Format: "3 - 8 Dec 2025"
            day = match[5]; // last day
            month = monthReplacements[match[6]] || match[6];
            year = match[7];
        } else if (match[8] && match[9] && match[10] && match[11] && match[12]) {
            // Format: "8 Dec - 1 Jan 2026"
            day = match[10]; // last day
            month = monthReplacements[match[11]] || match[11];
            year = match[12];
        }

        if (day && month && year) {
            const parsedDate = new Date(`${month} ${day}, ${year}`);
            if (!latestDate || parsedDate > latestDate) {
                latestDate = parsedDate;
            }
        }
    }

    if (latestDate) {
        const fullMonth = latestDate.toLocaleString("en-US", { month: "long" });
        const year = latestDate.getFullYear();
        const result = `${fullMonth} ${year}`;
        console.log("Latest Month-Year:", result);
        return result;
    }

    // if no date is found then return current user month and year
    const now = new Date();
    const currentMonth = now.toLocaleString("en-US", { month: "long" });
    const currentYear = now.getFullYear();
    const fallbackResult = `${currentMonth} ${currentYear}`;
    console.log("Fallback to Current Month-Year:", fallbackResult);
    return fallbackResult;
};
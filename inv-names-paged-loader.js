/* ==========================================================================
   Paged loading of the names saved in a Supabase table.

   The newest names are shown as soon as they arrive (a small first page for
   the fastest possible first paint), then the older ones keep loading in the
   background into an array without touching the page, so the search bar
   filters that array instead of waiting on further network requests.

   The saved content itself is never held in memory, it is read from Supabase
   only for the name the user picks.
   ========================================================================== */




/* How many names are shown right away, and how big every background page is.
   A few background pages are asked for at once, so a big table does not take
   long before the search bar can match against every saved name */
const INV_NAMES_FIRST_PAGE_SIZE = 300;
const INV_NAMES_BACKGROUND_PAGE_SIZE = 500;
const INV_NAMES_BACKGROUND_PAGES_AT_ONCE = 3;




/* ==========================================================================
   The animated "Loading Data" status

   It stands in for the "No matching data found." text for as long as pages of
   the table are still on their way, so a search never tells the user a name
   does not exist while the page holding it has not arrived yet.
   ========================================================================== */

const INV_NAMES_LOADING_INDICATOR_STYLE_ID = 'inv_names_loading_indicator_style';

const addInvNamesLoadingIndicatorStyle = () => {
    if (document.getElementById(INV_NAMES_LOADING_INDICATOR_STYLE_ID)) return;

    const loadingIndicatorStyle = document.createElement('style');
    loadingIndicatorStyle.id = INV_NAMES_LOADING_INDICATOR_STYLE_ID;
    loadingIndicatorStyle.textContent = `
        .inv_names_loading_indicator {
            width: 100%;
            padding: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            direction: ltr;
            font-weight: bold;
            box-sizing: border-box;
        }

        .inv_names_loading_indicator_spinner {
            width: 18px;
            height: 18px;
            flex: none;
            border: 3px solid rgba(0, 0, 0, 0.15);
            border-top-color: rgb(0, 155, 0);
            border-radius: 50%;
            animation: inv_names_loading_indicator_spin 0.8s linear infinite;
        }

        .inv_names_loading_indicator_text {
            animation: inv_names_loading_indicator_fade 1.4s ease-in-out infinite;
        }

        .inv_names_loading_indicator_dots {
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }

        .inv_names_loading_indicator_dots i {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background-color: currentColor;
            animation: inv_names_loading_indicator_bounce 1.4s ease-in-out infinite;
        }

        .inv_names_loading_indicator_dots i:nth-child(2) { animation-delay: 0.2s; }
        .inv_names_loading_indicator_dots i:nth-child(3) { animation-delay: 0.4s; }

        @keyframes inv_names_loading_indicator_spin {
            to { transform: rotate(360deg); }
        }

        @keyframes inv_names_loading_indicator_fade {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.45; }
        }

        @keyframes inv_names_loading_indicator_bounce {
            0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
            40% { opacity: 1; transform: translateY(-4px); }
        }

        /* Users who asked their system for less movement only get the fading text */
        @media (prefers-reduced-motion: reduce) {
            .inv_names_loading_indicator_spinner,
            .inv_names_loading_indicator_dots i {
                animation: none;
            }
        }
    `;

    document.head.appendChild(loadingIndicatorStyle);
};


const buildInvNamesLoadingIndicator = () => {
    addInvNamesLoadingIndicatorStyle();

    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'inv_names_loading_indicator';
    loadingIndicator.innerHTML = `
        <span class="inv_names_loading_indicator_spinner"></span>
        <span class="inv_names_loading_indicator_text">Loading Data</span>
        <span class="inv_names_loading_indicator_dots"><i></i><i></i><i></i></span>
    `;

    return loadingIndicator;
};




/* ==========================================================================
   Showing the year of the invoice in front of its name ("26__1584 Mr. ...")
   ========================================================================== */

/* The year of the first dated row of a saved invoice. Every row type keeps its
   date in its first <p>, so the optional hotel rows container is not needed */
const getInvoiceYearFromContent = (content) => {
    const savedInvoice = new DOMParser().parseFromString(content || '', 'text/html');
    const savedInvoiceRows = savedInvoice.querySelector('#invoice_company_main_table_div_id')
        ?.querySelectorAll('.invoice_company_row_div_class') || [];

    for (const savedInvoiceRow of savedInvoiceRows) {
        const rowDate = (savedInvoiceRow.querySelector('p')?.textContent || '').replace(/\s+/g, ' ').trim();
        const foundYear = (rowDate.match(/\b(?:19|20)\d{2}\b/g) || [])[0];

        if (foundYear) return foundYear;
    }

    return '';
};


const buildInvoiceNameLabelWithYear = (name, content) => {
    const invoiceYear = getInvoiceYearFromContent(content);

    return invoiceYear ? `${invoiceYear.slice(-2)}__${name}` : name;
};


/* The "26__" is only shown in front of the name, the saved names never hold it */
const cleanInvoiceNameSearchText = (searchText) => searchText.replace(/^\d{2}__/, '');




const createInvNamesLoader = ({
    tableName,                          // 'inv_tax_indo'
    contentColumn,                      // 'inv_tax_indo_content'
    orderColumn,                        // 'inv_tax_user_current_date' (newest first)
    containerId,                        // Where the <h3> names are appended
    namesStore,                         // The array every loaded name is pushed into
    onNameClick,                        // What a click on a name does
    nameDataAttributes = {},            // Extra data attributes to set on every name
    buildNameLabel = null,              // (name, content) => the text shown for a name
    cleanSearchText = (searchText) => searchText,
    isActive = () => true,              // False while another list is using the container
    getSupabaseClient = () => supabase
}) => {

    const loaderState = {
        offset: 0,
        hasMore: true,
        started: false,
        firstPageLoaded: false,
        /* False for as long as pages are still being fetched, which is what keeps
           the "No matching data found." text away from a half filled array */
        allNamesLoaded: false,
        firstPageNames: [],
        addedNames: new Set(),
        nameLabels: new Map(),
        nameElements: new Map()
    };

    /* Resolves once every single name of the table sits in the array */
    let resolveAllNamesLoaded = null;
    let allNamesLoaded = new Promise(resolve => { resolveAllNamesLoaded = resolve; });


    const getContainer = () => document.getElementById(containerId);

    /* The search bar of the dropdown the container belongs to (some apps have more than one) */
    const getSearchInput = () => getContainer()
        ?.closest('.searchable_names_dropdown_class')
        ?.querySelector('.search_bar_input_class');




    /* ======================================================================
       Showing the names
       ====================================================================== */

    /* Every name keeps the same <h3> for the whole session, so a re-render
       never loses what the user already selected */
    const getNameElement = (name) => {
        const storedNameElement = loaderState.nameElements.get(name);
        if (storedNameElement) return storedNameElement;

        const nameElement = document.createElement("h3");
        nameElement.textContent = loaderState.nameLabels.get(name) || name;
        nameElement.setAttribute('data-original-name', name);

        Object.entries(nameDataAttributes).forEach(([attributeName, attributeValue]) => {
            nameElement.setAttribute(attributeName, attributeValue);
        });

        nameElement.onclick = function () {
            onNameClick(this);
        };

        loaderState.nameElements.set(name, nameElement);
        return nameElement;
    };


    const showLoadingIndicator = () => {
        const container = getContainer();
        if (!container || container.querySelector('.inv_names_loading_indicator')) return;

        container.appendChild(buildInvNamesLoadingIndicator());
    };


    /* Renders a fixed set of names (the first page, or the search results) */
    const renderNames = (names) => {
        const container = getContainer();
        if (!container) return;

        container.innerHTML = '';

        if (names.length === 0) {
            /* Nothing matched, but pages are still arriving, so the name the user is
               after may simply not be in the array yet. The search runs again on its
               own once the last page lands, and only then can the miss be reported */
            if (!loaderState.allNamesLoaded) {
                showLoadingIndicator();
                return;
            }

            container.insertAdjacentHTML('beforeend', '<p>No matching data found.</p>');
            return;
        }

        const namesFragment = document.createDocumentFragment();

        names.forEach(name => {
            const nameElement = getNameElement(name);
            /* The shared search bar hides the names it filters out, so show it again */
            nameElement.style.display = '';
            namesFragment.appendChild(nameElement);
        });

        container.appendChild(namesFragment);
    };


    /* Filters the array that was filled in the background instead of asking Supabase again */
    const applySearchFilter = () => {
        if (!isActive()) return;

        const container = getContainer();
        const searchInput = getSearchInput();
        if (!container || !searchInput) return;

        if (!loaderState.firstPageLoaded) {
            container.innerHTML = '';
            showLoadingIndicator();
            return;
        }

        const searchWords = cleanSearchText(searchInput.value.trim()).toLowerCase().split(/\s+/).filter(Boolean);

        if (searchWords.length === 0) {
            renderNames(loaderState.firstPageNames);
            return;
        }

        const matchingNames = [];

        namesStore.forEach(row => {
            const name = row.name || '';
            const lowerCasedName = name.toLowerCase();

            if (searchWords.every(searchWord => lowerCasedName.includes(searchWord))) {
                matchingNames.push(name);
            }
        });

        renderNames(matchingNames);
    };


    /* Called when this list takes the container over from another list */
    const showList = () => {
        const searchInput = getSearchInput();
        if (searchInput) searchInput.value = '';

        applySearchFilter();
    };


    /* Puts every name back to the unselected look (the hidden ones too) */
    const clearSelection = () => {
        loaderState.nameElements.forEach(nameElement => {
            nameElement.style.backgroundColor = 'white';
            nameElement.style.color = 'black';
        });
    };




    /* ======================================================================
       Fetching the names
       ====================================================================== */

    /* Newest first, with the name as a tiebreaker so equal times still page deterministically.
       The saved content only comes along when the shown text is built out of it */
    const fetchNamesPage = (offset, pageSize) => getSupabaseClient()
        .from(tableName)
        .select(buildNameLabel ? `name, ${contentColumn}` : 'name')
        .order(orderColumn, { ascending: false })
        .order('name', { ascending: true })
        .range(offset, offset + pageSize - 1);


    const storeFetchedNames = (rows) => {
        const addedNames = [];

        rows.forEach(row => {
            const name = row.name?.trim();
            if (!name || loaderState.addedNames.has(name)) return;

            loaderState.addedNames.add(name);

            /* Reading the content is expensive, so the shown text is built once here
               (at fetch time) and the content itself is dropped right after */
            if (buildNameLabel) loaderState.nameLabels.set(name, buildNameLabel(name, row[contentColumn]));

            namesStore.push({ name });
            addedNames.push(name);
        });

        return addedNames;
    };


    const loadFirstPage = async () => {
        if (isActive()) {
            const container = getContainer();
            if (container) container.innerHTML = '';
            showLoadingIndicator();
        }

        const { data, error } = await fetchNamesPage(0, INV_NAMES_FIRST_PAGE_SIZE);

        if (error) {
            console.error(`❌ Error fetching the saved names of "${tableName}" from Supabase:`, error);

            if (isActive()) {
                const container = getContainer();
                if (container) container.innerHTML = '<p>Could not load the data, please try again.</p>';
            }
            return;
        }

        const rows = data || [];
        loaderState.offset = rows.length;
        loaderState.hasMore = rows.length === INV_NAMES_FIRST_PAGE_SIZE;
        loaderState.firstPageNames = loaderState.firstPageNames.concat(storeFetchedNames(rows));
        loaderState.firstPageLoaded = true;

        applySearchFilter();
    };


    /* Keeps pulling the older pages into the array after the newest page is already on
       screen, purely so the search bar can match against every saved name.
       These names are never appended to the visible list */
    const loadRemainingNamesInBackground = async () => {
        while (loaderState.hasMore) {
            /* The pages are asked for together, but they are read in their own order */
            const pageOffsets = [];
            for (let pageNumber = 0; pageNumber < INV_NAMES_BACKGROUND_PAGES_AT_ONCE; pageNumber++) {
                pageOffsets.push(loaderState.offset + (pageNumber * INV_NAMES_BACKGROUND_PAGE_SIZE));
            }

            const fetchedPages = await Promise.all(pageOffsets.map(
                pageOffset => fetchNamesPage(pageOffset, INV_NAMES_BACKGROUND_PAGE_SIZE)
            ));

            loaderState.offset += pageOffsets.length * INV_NAMES_BACKGROUND_PAGE_SIZE;

            let addedNamesCount = 0;

            for (const { data, error } of fetchedPages) {
                if (error) {
                    console.error(`❌ Error fetching the saved names of "${tableName}" from Supabase:`, error);
                    loaderState.hasMore = false;
                    break;
                }

                const rows = data || [];
                addedNamesCount += storeFetchedNames(rows).length;

                /* A page that is not full means the table has no more rows left */
                if (rows.length < INV_NAMES_BACKGROUND_PAGE_SIZE) loaderState.hasMore = false;
            }

            const searchInput = getSearchInput();
            if (addedNamesCount > 0 && searchInput && searchInput.value.trim()) {
                /* A search is running, so the names that just arrived have to join the results */
                applySearchFilter();
            }
        }

        loaderState.allNamesLoaded = true;

        /* The array is complete now, so a list that is still showing the animated status
           has to be rendered one last time to settle on its real answer */
        if (getContainer()?.querySelector('.inv_names_loading_indicator')) applySearchFilter();

        resolveAllNamesLoaded();
    };


    const start = async () => {
        if (loaderState.started) return;
        loaderState.started = true;

        await loadFirstPage();
        loadRemainingNamesInBackground();
    };


    /* Reads the saved content of one name only when it is really needed */
    const fetchContentForName = async (name) => {
        const { data, error } = await getSupabaseClient()
            .from(tableName)
            .select(contentColumn)
            .eq('name', name)
            .limit(1);

        if (error) {
            console.error(`❌ Error fetching the saved content of "${name}" from Supabase:`, error);
            return null;
        }

        return data?.[0]?.[contentColumn]?.trim() || null;
    };


    /* Fetches the whole table again (used after a new invoice was saved) */
    const reload = async () => {
        loaderState.offset = 0;
        loaderState.hasMore = true;
        loaderState.started = false;
        loaderState.firstPageLoaded = false;
        loaderState.allNamesLoaded = false;
        loaderState.firstPageNames = [];
        loaderState.addedNames.clear();
        loaderState.nameLabels.clear();
        /* The shown text is built again, so the names are built again too */
        loaderState.nameElements.clear();
        namesStore.length = 0;

        allNamesLoaded = new Promise(resolve => { resolveAllNamesLoaded = resolve; });

        await start();
    };




    /* The search bar filters the names of whichever list is using the container */
    const searchInput = getSearchInput();
    if (searchInput) {
        searchInput.addEventListener('input', applySearchFilter);
    } else {
        console.error(`❌ Could not find the search bar of #${containerId}`);
    }


    return {
        start,
        reload,
        showList,
        clearSelection,
        applySearchFilter,
        fetchContentForName,
        getAllNameElements: () => [...loaderState.nameElements.values()],
        whenAllNamesLoaded: () => allNamesLoaded
    };
};

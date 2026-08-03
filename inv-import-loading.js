/* ==========================================================================
   The loading layer shown while a saved invoice is being imported.

   Importing reads the saved invoice out of Supabase and then rebuilds the
   whole page, which holds the browser still for a moment, so the layer is
   painted first and only then the work is started.
   ========================================================================== */




const INV_IMPORT_LOADING_LAYER_ID = 'inv_import_loading_layer_id';

/* Kept on screen at least this long, so a fast import still looks smooth */
const INV_IMPORT_LOADING_SHORTEST_TIME = 450;

/* Tells a waiting hiding apart from the import that started after it */
let invImportLoadingRun = 0;
let invImportLoadingShownAt = 0;




const buildInvImportLoadingLayer = () => {
    const builtLoadingLayer = document.getElementById(INV_IMPORT_LOADING_LAYER_ID);
    if (builtLoadingLayer) return builtLoadingLayer;

    const loadingLayerStyle = document.createElement("style");
    loadingLayerStyle.textContent = `
        #${INV_IMPORT_LOADING_LAYER_ID} {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(255, 255, 255, 0.75);
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.25s ease-in-out, visibility 0.25s ease-in-out;
        }

        #${INV_IMPORT_LOADING_LAYER_ID}.inv_import_loading_layer_shown_class {
            opacity: 1;
            visibility: visible;
        }

        #${INV_IMPORT_LOADING_LAYER_ID} .inv_import_loading_box_class {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 18px;
            padding: 30px 45px;
            border-radius: 14px;
            background-color: white;
            box-shadow: 0 10px 35px rgba(0, 0, 0, 0.18);
            transform: scale(0.92);
            transition: transform 0.25s ease-in-out;
        }

        #${INV_IMPORT_LOADING_LAYER_ID}.inv_import_loading_layer_shown_class .inv_import_loading_box_class {
            transform: scale(1);
        }

        #${INV_IMPORT_LOADING_LAYER_ID} .inv_import_loading_spinner_class {
            width: 46px;
            height: 46px;
            border: 4px solid rgba(0, 155, 0, 0.2);
            border-top-color: rgb(0, 155, 0);
            border-radius: 50%;
            animation: inv_import_loading_spin 0.8s linear infinite;
        }

        #${INV_IMPORT_LOADING_LAYER_ID} .inv_import_loading_text_class {
            margin: 0;
            padding: 0;
            font-size: 17px;
            font-weight: bold;
            letter-spacing: 0.5px;
            color: #222222;
            direction: ltr;
        }

        @keyframes inv_import_loading_spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(loadingLayerStyle);

    const loadingLayer = document.createElement("div");
    loadingLayer.id = INV_IMPORT_LOADING_LAYER_ID;
    loadingLayer.innerHTML = `
        <div class="inv_import_loading_box_class">
            <div class="inv_import_loading_spinner_class"></div>
            <p class="inv_import_loading_text_class">Importing</p>
        </div>
    `;
    document.body.appendChild(loadingLayer);

    /* The browser has to know the hidden look of the layer before the shown look is
       set on it, otherwise it has nothing to fade in from and the layer just snaps in */
    void loadingLayer.offsetHeight;

    return loadingLayer;
};




/* Shows the layer and waits until the browser really painted it, so the
   rebuilding that holds the page still can be started right after */
const showInvImportLoading = (loadingText = 'Importing') => {
    invImportLoadingRun++;
    invImportLoadingShownAt = Date.now();

    const loadingLayer = buildInvImportLoadingLayer();
    loadingLayer.querySelector('.inv_import_loading_text_class').innerText = loadingText;
    loadingLayer.classList.add('inv_import_loading_layer_shown_class');

    return new Promise(paintedTheLayer => {
        /* The frames never run while the page is not on screen (another tab is open),
           so the waiting is given an end of its own and the import always goes on */
        const waitedLongEnough = setTimeout(paintedTheLayer, 100);

        requestAnimationFrame(() => requestAnimationFrame(() => {
            clearTimeout(waitedLongEnough);
            paintedTheLayer();
        }));
    });
};




const hideInvImportLoading = async () => {
    const hidingRun = invImportLoadingRun;

    /* A fast import would only make the layer blink, so it is left the rest of its time */
    const restOfTheTime = INV_IMPORT_LOADING_SHORTEST_TIME - (Date.now() - invImportLoadingShownAt);
    if (restOfTheTime > 0) await new Promise(waited => setTimeout(waited, restOfTheTime));

    /* Another import was started while this one was ending, so it owns the layer now */
    if (hidingRun !== invImportLoadingRun) return;

    document.getElementById(INV_IMPORT_LOADING_LAYER_ID)?.classList.remove('inv_import_loading_layer_shown_class');
};




/* Built as soon as the page is ready, so the very first import fades in
   as smoothly as all the ones coming after it */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => buildInvImportLoadingLayer());
} else {
    buildInvImportLoadingLayer();
}

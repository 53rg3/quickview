const converter = new showdown.Converter(config.showDownJsOptions)
const resultSetContainer = $('#result-set-container');
const resultSize = $('#result-size');
const searchInput = $('#search-input');
const fileList = $('#file-list');
const fileMap = new Map();
const debugContainer = $('#debug');
const errorIcon = "src/error.png";
const errors = [];
const fileScope = new Map(); // All files in focus. Only these will be used for search
const debouncedSearch = debounce(() => search(), config.debounceDelay);


function search() {
    let searchTerm = searchInput.val();
    if (searchTerm === "" || searchTerm.length < 2) {
        renderSearchResults(getAllSections());
        return;
    }

    let matchingSections = [];
    let searchRegex;
    try {
        searchRegex = new RegExp(searchTerm, "ig");
    } catch (e) {
        addError("Failed to parse regex: " + e);
        throw new Error(e);
    }
    fileScope.forEach(function (file) { // Loop through each file in focus
        $(file.sections).each(function (index, section) { // Loop through each section
            let matches = section.match(searchRegex);
            if (matches != null) { // If section contains match(es)
                matchingSections.push(addHighlighting(section, searchRegex, matches[0])); // Add to matchingSections with highlights
            }
        });
    });
    renderSearchResults(matchingSections);
}

function addHighlighting(section, searchRegex, match) {
    if (section.indexOf("```") === -1) { // No highlight if code block included, because HTML is getting printed in <pre><code> blocks.
        return section.replace(searchRegex, "<span class='hl'>" + match + "</span>");
    }
    return section;
}

function loadFile(file) {
    $.ajax({
        url: file.path,
        dataType: "text",
        success: function (response) {
            file.sections = extractSections(response);
            renderInitialFile(file);
        },
        error: function (response, textStatus, errorThrown) {
            addError("Failed to load " + file.path + " (" + errorThrown + ")");
        }
    });
}

function renderInitialFile(file) {
    if (!file.isFirst) {
        return;
    }
    fileList.find('span').first().click();
}

function extractSections(markdown) {
    return markdown.split("---").map(function (section) {
        return section.trim();
    });
}

function renderSearchResults(sections) {
    if (sections.length === 0) {
        resultSetContainer.html("" +
            "<div class='section' style='padding: 20px'>" +
            "Can't find '" + searchInput.val() + "' in files in focus files" +
            "</div>");
        setResultSize(0);
        return;
    }

    let sectionsToOmit = 0;
    let omissions = "";
    if (sections.length > config.maxSectionsToShow) {
        sectionsToOmit = sections.length - config.maxSectionsToShow;
        omissions = "<div>" +
            "Skipped sections: " + sectionsToOmit + " (max is set to " + config.maxSectionsToShow + ", see config.js)" +
            "</div>";
        sections = sections.splice(0, config.maxSectionsToShow);
    }

    resultSetContainer.html(
        convertMarkdownToHtml(sections) +
        omissions
    );
    setResultSize(sections.length);
    loadHighlightJs();
}

function setResultSize(amount) {
    resultSize.html("Results: " + amount);
}

function convertMarkdownToHtml(sections) {
    let html = "";
    $(sections).each(function (index, section) {
        html += "<div class='section'>" + converter.makeHtml(section) + "</div>";
    });
    return html;
}


function getAllSections() {
    let sections = [];
    fileScope.forEach(function (file) {
        sections.push.apply(sections, file.sections);
    });
    return sections;
}

function setFocus(fileKey, element) {
    let file = fileMap.get(fileKey);
    if (!file) {
        addError("Couldn't find file with key '" + fileKey + "'. Probably a bug...");
        $(element).toggleClass("strikethrough");
        return;
    }
    $(element).toggleClass("focus");

    let scopeFile = fileScope.get(fileKey)
    if (!scopeFile) {
        fileScope.set(fileKey, file);
    } else {
        fileScope.delete(fileKey);
    }

    search();
}

function initialize() {
    if (config.files.length === 0) {
        let msg = "No files defined in config.js";
        addError(msg);
        throw new Error(msg);
    }

    let html = "";
    $(config.files).each(function (index, file) {
        index === 0 ? file.isFirst = true : file.isFirst = false;

        let hash = toHash(file.path);
        html += createButtonHtml(file, index, hash);
        fileMap.set(hash, file);

        loadFile(file);
    });
    fileList.html(html);
}

function createButtonHtml(file, index, hash) {
    let shortCut = "(" + (index + 1) + ")"
    return "" +
        "<span " +
        "id='" + hash + "' " +
        "onclick='setFocus(\"" + hash + "\", this)'>"
        + shortCut + " " + file.label +
        "</span>";
}

function renderTitle() {
    $('#title').text(config.title);
}

function addError(message) {
    errors.push(message);
    renderErrors();
}

function renderErrors() {
    debugContainer.html("");
    let html = "";
    $(errors).each(function (index, error) {
        html += "<img alt='' class='error-icon' src='" + errorIcon + "' />" + error + "<br>";
    });
    debugContainer.html(html);
}

function loadHighlightJs() {
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
    });
}

// from here: https://stackoverflow.com/a/7616484
function toHash(str) {
    let hash = 0, i, chr;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    if (hash < 0) {
        hash = hash * -1;
    }
    return hash.toString();
}

// from here: https://www.freecodecamp.org/news/javascript-debounce-example/
function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
}

function setFocusByShortcut(numberKey) {
    let element = fileList.children().eq(parseInt(numberKey) - 1);
    setFocus(element.attr("id"), element);
}

function selectAllOrNone() {
    let atLeastOneFileHasFocus = hasAtLeastOneFileFocus();
    if (atLeastOneFileHasFocus) {
        deselectAll();
    } else {
        selectAll();
    }
}

function hasAtLeastOneFileFocus() {
    let atLeastOneFileHasFocus = false;
    fileList.children().each(function (index, elem) {
        if ($(elem).hasClass("focus")) {
            atLeastOneFileHasFocus = true;
        }
    });
    return atLeastOneFileHasFocus;
}

function deselectAll() {
    fileList.children().each(function (index, elem) {
        elem = $(elem);
        if (elem.hasClass("focus")) {
            setFocus(elem.attr('id'), elem);
        }
    });
}

function selectAll() {
    fileList.children().each(function (index, elem) {
        setFocus($(elem).attr('id'), elem);
    });
}

function resetAll() {
    searchInput.val("");
    deselectAll();
}

document.onkeyup = function (e) {
    if (searchInput.is(":focus")) {
        return;
    }

    switch (e.code) {
        case "Digit1":
        case "Digit2":
        case "Digit3":
        case "Digit4":
        case "Digit5":
        case "Digit6":
        case "Digit7":
        case "Digit8":
        case "Digit9":
        case "Digit0":
            if (fileMap.size >= e.key) {
                setFocusByShortcut(e.key);
            }
            break;

        case "KeyA":
        case "KeyB":
        case "KeyC":
        case "KeyD":
        case "KeyE":
        case "KeyF":
        case "KeyG":
        case "KeyH":
        case "KeyI":
        case "KeyJ":
        case "KeyK":
        case "KeyL":
        case "KeyM":
        case "KeyN":
        case "KeyO":
        case "KeyP":
        case "KeyQ":
        case "KeyR":
        case "KeyS":
        case "KeyT":
        case "KeyU":
        case "KeyV":
        case "KeyW":
        case "KeyX":
        case "KeyY":
        case "KeyZ":
        case "Space":
            searchInput.val(searchInput.val() + e.key);
            search();
            break;

        case "Backspace":
            searchInput.val(searchInput.val().substring(0, searchInput.val().length - 1)); // Remove last character
            search();
            break;

        case "Backquote":
            selectAllOrNone();
            break;

        case "Escape":
            resetAll();
            break;
    }

    return false;
}

renderTitle();
initialize();


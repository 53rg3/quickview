
// Files to load. Can be either relative path from quickview.html or an URL
// First file will be shown when loading quickview.html and the focus will be on it
const files = [
    { path: "examples/help.md", label: "Help" },
    { path: "examples/animals.md", label: "Animals" },
    { path: "examples/code.md", label: "Code" },
    { path: "notes/your_notes.md", label: "Your Notes" }
];

// Page title of the quickview.html
const title = "QuickView";

// When matching sections exceed this limit, then the rest will not be rendered
const maxSectionsToShow = 50;

// Search can be fired with delay to reduce total amount of searches when typing. Useful when you have many or large files.
// Delay of 0 means that a new search will be triggered with every keystroke, without any delay.
const debounceDelay = 0;

// See https://github.com/showdownjs/showdown#options - that's the markdown to HTML converter
const showDownJsOptions = {
}


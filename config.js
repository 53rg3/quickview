const config = {

    // Files to load. Can be either relative path from quickview.html or an URL
    // First file will be shown when loading quickview.html and the focus will be on it
    files: [
        {path: "examples/help.md", label: "Help"},
        {path: "examples/animals.md", label: "Animals"},
        {path: "examples/code.md", label: "Code"},
        {path: "notes/your_notes.md", label: "Your Notes"}
    ],

    // Server settings
    host: 'localhost', // Needs to be configured in your hosts file FIRST, e.g. "127.0.0.1  quickview.loc"
    port: 8888, // If you want 80, then you need to run the server with sudo

    // When matching sections exceed this limit, then the rest will not be rendered
    maxSectionsToShow: 50,

    // Page title of your quickview.html
    // In case you want to run multiple instances, this makes it easier to find them in the browser
    title: "QuickView",

    // Search can be fired with delay to reduce total amount of searches when typing. Useful when you have many or large files.
    // Delay of 0 means that a new search will be triggered with every keystroke, without any delay.
    debounceDelay: 0,

    // See https://github.com/showdownjs/showdown#options - that's the markdown to HTML converter
    showDownJsOptions: {}
}

// Ignore this. Dirty hack.
try {
    module.exports = config;
} catch (e) {
}

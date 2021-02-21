# QuickView

Quickview lets you search through multiple Markdown files in a fast way. This is useful when you have many

- Links
- Code snippets
- Boilerplate text

You can configure files in `config.js`. These files must be separated into "sections" via the divider `---`. QuickView
will load these files, extract their sections and when you search then it will instantly display the sections which match 
your search term. 



## How to

- Put your files you want to search in some folder (preferably relative to `quickview.html`)
- Configure them in `config.js`. URLs to Markdown files work as well.
- Sections in a file (the portions of the files which you want to make searchable) are divided via `---`, e.g. 
   ```
  section 1
  ---
  section 2
  ---
  section 3
  ```
- Start QuickView via (you can configure host & port in `config.js`):
   ```
   node server.js
   ```

- Open browser at `http://localhost:8888/`
- You might want to consider an auto-startup for the server, and a shortcut for files folder for faster editing



## Shortcuts

You can navigate the application with the mouse!

- **Number keys (1,2,3...)**
  
  Select or unselect one of your configured documents from the search focus
  
- **TAB**
  
  Focus or unfocus the search field
  
- **ESC** 
  
  Delete search input 
  
- **Caret (^)**
  
  Backquote on EN keyboard, selects or unselects all configured documents



## Regex

Note that the search works with regex. That means:

- If you use special characters then you need to escape them (e.g. `()[]{}*+.`)
- The regex is set to case-insensitive
- You can emulate an `OR` operator with a construct like `(term1|term2)`. Oops, just saw that the highlighting is buggy, but it works, technically.



## Todo

- [ ] Remove the highlighting. Just makes thing way more complicated without much benefit.
- [ ] Copy function for code block
- [ ] Edit function for code blocks, i.e. that the block is turned into a textarea so that you replace values before copying

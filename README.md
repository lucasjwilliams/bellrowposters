# Named Row Posters

Make a printable poster of named call change rows, like Queens, Tittums and Whittingtons, for your tower.

**Live site:** https://rows.lucasw.uk

Choose which numbers of bells to show, tick the rows you want, rename them or add your own, choose a colour and layout, then print it, save it as a PDF or download it as an image. A share link opens the poster exactly as you left it.

## How it works

It's a static site with no build step: `index.html`, `style.css` and `app.js`.

The standard rows are listed in `LIBRARY` in `app.js`. Rounds, Queens, Kings, Tittums and Back rounds follow a pattern, so they are worked out for any number of bells; the others are listed for the numbers of bells they exist on:

```js
{ name: 'Whittingtons', values: { 6: '125346', 8: '12753468' }, on: true },
```

`on: true` ticks the row by default. Rows use `1`–`9`, then `0`, `E` and `T` for the 10th, 11th and 12th.

## Running locally

Opening `index.html` directly works for everything except **Download as image**, which browsers block for local files. Use a local server for that:

```sh
python3 -m http.server
```

## Credits

- Named rows from the [Association of Ringing Teachers](https://ringingteachers.org/resources/Method-Toolboxes/call-change-toolbox).
- Image export uses [html2canvas](https://html2canvas.hertzen.com/).

The code is released under the [MIT License](LICENSE).

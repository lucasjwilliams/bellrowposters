# Named Row Posters

Make a printable poster of named call change rows, like Queens, Tittums and Whittingtons, for your tower.

**Live site:** https://rows.lucasw.uk

Choose which numbers of bells to show, tick the rows you want, rename them or add your own, choose a colour and layout, then print it, save it as a PDF or download it as an image. A share link opens the poster exactly as you left it.

## How it works

It's a static site with no build step: `index.html`, `style.css` and `app.js`. Open `index.html` straight from disk, or serve the folder with any static server.

The standard rows are listed in `LIBRARY` in `app.js`. Rows that follow a pattern, like Queens, Kings and Tittums, are worked out for any number of bells by a rule in `RULES`; the others are listed for each number of bells:

```js
{ name: 'Wrap', values: { 5: '32154', 6: '321654', 7: '3217654', 8: '43218765', 10: '5432109876', 12: '654321TE0987' }, on: true },
```

`on: true` ticks the row by default. Rows use `1`–`9`, then `0`, `E` and `T` for the 10th, 11th and 12th.

## Credits

- Image export uses [html2canvas](https://html2canvas.hertzen.com/).

The code is released under the [MIT License](LICENSE).

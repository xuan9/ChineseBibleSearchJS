# ChineseBibleSearchJS
Chinese Bible text, indexes, and search APIs.

聖經和合本正体字文本，索引和搜索。

＊可以用[ChineseConverterJS](https://github.com/xuan9/ChineseConverterJS)轉換成簡體字。

### APIs
- setOptions
- indexSearch

### Example
```javascript
var bibleSearch = require('chinese-bible-search');

bibleSearch.setOptions({
  onError: function(err, source) {
    console.error(source ? err + ": " + source : err);
  },
  onTitle: function(title) {
    console.info("---- " + title + " ----");
  },
  onTextLine: function(prefix, text) {
    console.info(prefix + " " + text);
  }
});

bibleSearch.indexSearch('創 1：1，太5:3－9 馬太福音5，6，7');
```

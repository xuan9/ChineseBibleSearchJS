# ChineseBibleSearchJS
Chinese Bible text, indexes, and search APIs.
聖經和合本文本，索引和搜索。

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

console.log(bibleSearch.indexSearch('创 1：1，太5:3－9 马太福音5，6，7'));
```

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['bibleText', 'bibleIndexes'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('./bibleText'), require('./bibleIndexes'), require('chinese-converter'));
  } else {
    root.bibleSearch = factory(root.bibleText, root.bibleIndexes);
  }
}(this, function(bibleText, bibleIndexes) {
  var Searcher = {
    onError: function(err, source) {
      console.error(source ? err + ": " + source : err);
    },
    onTitle: function(title) {
      console.info("---- " + title + " ----");
    },
    onTextLine: function(prefix, text) {
      console.info(prefix + " " + text);
    }
  };

  var setOptions = function(opts) {
    for (var att in opts) {
      Searcher[att] = opts[att];
    }
  };

  var valideLine = function(mainLine, bookName, chapterIndex, line) {
    if (mainLine == -1) Searcher.onError("找不到書名", bookName);
    else if (mainLine == -2) Searcher.onError("章節不存在", bookName + " " + chapterIndex);
    else if (mainLine == -3) Searcher.onError("句子不存在", bookName + " " + chapterIndex + ":" + line);
    else {
      return true;
    };
    return false;
  };

  var findLines = function(startLine, endLine, bookName) {
    for (var i = startLine; i <= endLine; i++) {
      var l = bibleText[i];
      var spaceIndex = l.indexOf(' ');
      if (spaceIndex > 0) {
        Searcher.onTextLine(l.substring(0, spaceIndex), l.substring(1 + spaceIndex))
      } else {
        Searcher.onTextLine('', l);
      }
    }
  };

  // requires bookName to be traditional chinese
var find = function(bookName, iChapterIndex1, iLine1, iChapterIndex2, iLine2) {
    // console.log('search ' + bookName + " " + iChapterIndex1 + ":" + iLine1 + " -- " + iChapterIndex2 + ":" + iLine2);
    var bookIndex = bibleIndexes.getBookIndex(bookName);
    var chapterIndex1, line1, chapterIndex2, line2;
    chapterIndex1 = iChapterIndex1 === -1 ? 1 : iChapterIndex1;
    chapterIndex2 = iChapterIndex2 === -1 ?
      (iChapterIndex1 === -1 ? bibleIndexes.getTotalChapters(bookIndex) : iChapterIndex1) : iChapterIndex2;
    line1 = iLine1 === -1 ? 1 : iLine1;
    line2 = iLine2 === -1 ? (bibleIndexes.getTotalLines(bookIndex,
      chapterIndex2)) : iLine2;
    var totalChapters = bibleIndexes.getTotalChapters(bookIndex);
    var startLine = bibleIndexes.searchLine(bookIndex, chapterIndex1, line1);
    var endLine = bibleIndexes.searchLine(bookIndex, chapterIndex2, line2);
    // console.log("startLine: " + startLine + ", endLine: " + endLine);
    if (!valideLine(startLine, bookName, chapterIndex1, line1) || !valideLine(endLine, bookName, chapterIndex2,
        line2)) return false; //validate lines
    //validations
    if (chapterIndex1 > chapterIndex2) {
      Searcher.onError("章節順序錯誤", bookName + " " + chapterIndex1 + ": " + chapterIndex2);
      return false;
    } else if (chapterIndex1 === chapterIndex2) {
      if (line2 < line1) {
        Searcher.onError("句子順序錯誤", bookName + " " + chapterIndex1 + ": " + line1 + " - " + line2);
        return false;
      }
    }

    if (endLine < startLine) {
      var tmp = endLine;
      endLine = startLine;
      startLine = tmp;
    }

    var title = bibleIndexes.getFullName(bookName);
    if (chapterIndex1 === chapterIndex2) {
      title += ' ' + chapterIndex1;
      if (line1 === line2) title += ":" + line1;
      else if (line1 != line2 && !(iLine1 === -1 && iLine2 === -1)) title += ":" + line1 + "-" + line2;
    } else {
      if (iChapterIndex1 === -1 && iChapterIndex2 === -1);
      else if ((iLine1 === -1 && iLine2 === -1)) title += " " + chapterIndex1 + "-" + chapterIndex2;
      else title += ' ' + chapterIndex1 + ":" + line1 + "-" + chapterIndex2 + ":" + line2;
    };

    Searcher.onTitle(title);
    findLines(startLine, endLine, bookName);
    return true;
  };

  var indexSearch = function(query) {
    if (!query) query = '';
    var isFound = false,
      isNoError = true;
    var reBooks = /\s*([\u4e00-\u9fa5]{1,10})([\s0-9\:：•\-－,，]*)/g;
    var re = /\s*•?\s*([0-9]+)\s*(?:[:：]\s*([0-9]+)(?:\s*[-－]\s*([0-9]+))?((?:\s*[,，]\s*[0-9]+)*))?/g;
    var m;
    while ((m = reBooks.exec(query)) !== null) {
      if (m.index === reBooks.lastIndex) {
        reBooks.lastIndex++;
      }
      var bookName = m[1];
      var indexes = m[2].trim();
      var m2;
      if (indexes.trim() == '') {
        isNoError = find(bookName, -1, -1, -1, -1);
        isFound = true;
      } else {
        while ((m2 = re.exec(indexes)) !== null) {
          if (m2.index === re.lastIndex) {
            re.lastIndex++;
          }
          var chapterIndex1 = m2[1] ? parseInt(m2[1]) : -1,
            lineIndex1 = m2[2] ? parseInt(m2[2]) : -1,
            lineIndex2 = m2[3] ? parseInt(m2[3]) : -1,
            moreLines = m2[4];
          isFound = true;
          if (lineIndex2 !== -1) {
            isNoError = find(bookName, chapterIndex1, lineIndex1, chapterIndex1, lineIndex2) && isNoError;
          } else {
            isNoError = find(bookName, chapterIndex1, lineIndex1, chapterIndex1, lineIndex1) && isNoError;
            if (moreLines != '') {
              var reLines = /\s*[,，]\s*([0-9]+)/g;
              var m3;
              while ((m3 = reLines.exec(moreLines)) !== null) {
                if (m3.index === reLines.lastIndex) {
                  reLines.lastIndex++;
                }
                var lineIndex = parseInt(m3[1]);
                isNoError = find(bookName, chapterIndex1, lineIndex, chapterIndex1, lineIndex) && isNoError;
              }
            }
          }
          if (indexes == '') {
            break;
          }
        }
      }
    }
  };
  Searcher.indexSearch = indexSearch;
  Searcher.setOptions = setOptions
  return Searcher;
}));

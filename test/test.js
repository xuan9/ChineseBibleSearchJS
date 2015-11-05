var assert = require('assert');
var bibleSearch = require('../bibleSearch');
describe('ChineseBibleSearch', function() {
  describe('#toSimplifiedChinese()', function () {
    var query  = '創 1：1，馬太福音5:3－5 太 3 and 錯誤書名1';
    //expectations
    var titles = ['創世記 1:1', '馬太福音 5:3-5', '馬太福音 3'];
    var lines = ['創1:1 $ 起初，神創造天地。',
                '太5:3 $ 虛心的人有福了！因為天國是他們的。',
                '太5:4 $ 哀慟的人有福了！因為他們必得安慰。',
                '太5:5 $ 溫柔的人有福了！因為他們必承受地土。'];
    var titleIndex = 0, lineIndex = 0;

    it('test query "' + query + '"', function (done) {

      bibleSearch.setOptions({
        onError: function(err, source) {
          assert.equal('找不到書名', err);
          assert.equal('錯誤書名', source);
          done();
        },
        onTitle: function(title) {
          assert.equal(titles[titleIndex++], title);
        },
        onTextLine: function(prefix, text) {
          //'創世記 1:1', '馬太福音 5:3-5'
          if(lineIndex < 4){
            assert.equal(lines[lineIndex], prefix + " $ " + text);
          }
          //for '馬太福音 3'
          if(lineIndex == 4){
            assert.equal('那時，有施洗的約翰出來，在猶太的曠野傳道，說：', text);
          } else if(lineIndex == 20){
            assert.equal('從天上有聲音說：這是我的愛子，我所喜悅的。', text);
          } else if(lineIndex>20) done('should be no more line');
          //increase line index
          lineIndex++;
        }
      });
      bibleSearch.indexSearch(query);
    });
  });
});

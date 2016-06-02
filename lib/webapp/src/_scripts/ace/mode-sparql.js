ace.define("ace/mode/sparql_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(ace_require, exports, module) {
"use strict";

var oop = ace_require("../lib/oop");
var TextHighlightRules = ace_require("./text_highlight_rules").TextHighlightRules;

var SPARQLHighlightRules = function() {
  
  var keywords = (
      "BASE|BIND|PREFIX|SELECT|ASK|CONSTRUCT|DESCRIBE|FROM|NAMED|WHERE|GRAPH|AS|UNION|" +
      "FILTER|HAVING|VALUES|OPTIONAL|SERVICE|SILENT|DATA|ADD|MOVE|COPY|INSERT|DELETE|LOAD|" +
      "INTO|GRAPH|ALL|DEFAULT|CLEAR|CREATE|DROP|WITH|USING|DISTINCT|REDUCED|ORDER|ASC|DESC|OFFSET|" +
      "LIMITED|REDUCED|GROUP|BY|LIMIT|MINUS|NOT|IN|TO|AND|SEPARATOR"
  );
  
  var builtinConstants = (
      "True|False"
  );
  
  var builtinFunctions = (
    "STR|LANG|LANGMATCHES|DATATYPE|BOUND|IRI|URI|BNODE|RAND|ABS|CEIL|FLOOR|ROUND|CONCAT|STRLEN|" +
    "UCASE|LCASE|ENCODE_FOR_URI|CONTAINS|STRSTARTS|STRENDS|STRBEFORE|STRAFTER|YEAR|MONTH|DAY|HOURS|" +
    "MINUTES|SECONDS|TIMEZONE|TZ|NOW|UUID|STRUUID|MD5|SHA1|SHA256|SHA384|SHA512|COALESCE|IF|STRLANG|" +
    "STRDT|sameTerm|isIRI|isURI|isBLANK|isLITERAL|isNUMERIC|COUNT|SUM|MIN|MAX|AVG|SAMPLE|GROUP_CONCAT|" +
    "BOUND|COALESCE|NOT EXISTS|EXISTS|REGEX|SUBSTR|REPLACE"

  );
  
  var keywordMapper = this.createKeywordMapper({
      "constant.language": builtinConstants,
      "keyword.sparql" : keywords,
      "support.functions" : builtinFunctions
  }, "identifier", true);

  this.$rules = { start: 
     [ 
       { token: 'string.uri.turtle',
           regex: '<[^<>"{}|^`\\]\\\\]*>',
           comment: 'URI' 
       },
       { token: 'variable.sparql',
         regex: '(?:\\?[A-Za-z]+)',
         comment: 'Variables'},
       { token: [ 'constant.language.turtle', 'entity.name.class.turtle' ],
         regex: '(_:)([^\\s]+)',
         comment: 'Blank node' },
       { token: 'entity.name.class.rdfs-type.turtle',
         regex: '\\sa\\s',
         comment: 'The special triple predicate \'a\'' },
       { token: 
          [ 'string.turtle',
            'keyword.operator.turtle',
            'support.type.turtle' ],
         regex: '("[^"]*")(\\^\\^)(<[^<>"{}|^`\\]\\\\]*>|\\w*:[^\\s)]+)',
         comment: 'Typed literal' },
       {
         token : "paren.lparen",
         regex : "[\\(\\{]"
       }, {
         token : "paren.rparen",
         regex : "[\\)\\}]"
       },
       {
           token : "string",
           regex : '"""',
           next  : "qqstring"
       }, {
           token : "string", // single line
           regex : '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]'
       }, {
           token : "string", // single line
           regex : "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"
       },
       {
           token : "support.type.turtle",
           regex : '@[a-zA-Z]+(?:-[a-zA-Z0-9]+)*',
           comment : 'Language specifier'
       },
       { token: [ 'constant.other.turtle', 'entity.name.class.turtle' ],
         regex: '(\\w*:)([^\\s|/^*?+{}()]*)',
         comment: 'Prefix / prefixed URI' },
       {
         token: ['keyword.operator.sparql'],
         regex: '\\+|\\-|\\*|\\/|!|=|!=|<|>|<=|>=|&&|\\|\\|',
         comment: 'Operators'
       },
       { token: 'comment.line.number-sign.turtle',
         regex: '#.*$',
         comment: 'Comments' },
       { token: 'constant.numeric.turtle',
         regex: '\\b[+-]?(?:\\d+|[0-9]+\\.[0-9]*|\\.[0-9]+(?:[eE][+-]?\\d+)?)\\b',
         comment: 'Numeric literal' },
       {
         token : keywordMapper,
         regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
       } ],
        "qqstring" : [
            {
                token : "constant.language.escape",
                regex : /\\(?:u[0-9A-Fa-f]{4}|.|$)/
            }, {
                token : "constant.language.escape",
                regex : /\$[\w\d]+/
            }, {
                token : "constant.language.escape",
                regex : /\$\{[^"\}]+\}?/
            }, {
                token : "string",
                regex : '"{3,5}',
                next : "start"
            }, {
                token : "string",
                regex : '.+?'
            }
        ] }
       
    this.normalizeRules();
};

SPARQLHighlightRules.metaData = { fileTypes: [ 'sparql', 'rq' ],
      keyEquivalent: '^~S',
      name: 'SPARQL',
      scopeName: 'source.sparql' }


oop.inherits(SPARQLHighlightRules, TextHighlightRules);

exports.SPARQLHighlightRules = SPARQLHighlightRules;
});

ace.define("ace/mode/folding/cstyle",["require","exports","module","ace/lib/oop","ace/range","ace/mode/folding/fold_mode"], function(ace_require, exports, module) {
"use strict";

var oop = ace_require("../../lib/oop");
var Range = ace_require("../../range").Range;
var BaseFoldMode = ace_require("./fold_mode").FoldMode;

var FoldMode = exports.FoldMode = function(commentRegex) {
    if (commentRegex) {
        this.foldingStartMarker = new RegExp(
            this.foldingStartMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.start)
        );
        this.foldingStopMarker = new RegExp(
            this.foldingStopMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.end)
        );
    }
};
oop.inherits(FoldMode, BaseFoldMode);

(function() {
    
    this.foldingStartMarker = /(\{|\[)[^\}\]]*$|^\s*(\/\*)/;
    this.foldingStopMarker = /^[^\[\{]*(\}|\])|^[\s\*]*(\*\/)/;
    this.singleLineBlockCommentRe= /^\s*(\/\*).*\*\/\s*$/;
    this.tripleStarBlockCommentRe = /^\s*(\/\*\*\*).*\*\/\s*$/;
    this.startRegionRe = /^\s*(\/\*|\/\/)#region\b/;
    this._getFoldWidgetBase = this.getFoldWidget;
    this.getFoldWidget = function(session, foldStyle, row) {
        var line = session.getLine(row);
    
        if (this.singleLineBlockCommentRe.test(line)) {
            if (!this.startRegionRe.test(line) && !this.tripleStarBlockCommentRe.test(line))
                return "";
        }
    
        var fw = this._getFoldWidgetBase(session, foldStyle, row);
    
        if (!fw && this.startRegionRe.test(line))
            return "start"; // lineCommentRegionStart
    
        return fw;
    };

    this.getFoldWidgetRange = function(session, foldStyle, row, forceMultiline) {
        var line = session.getLine(row);
        
        if (this.startRegionRe.test(line))
            return this.getCommentRegionBlock(session, line, row);
        
        var match = line.match(this.foldingStartMarker);
        if (match) {
            var i = match.index;

            if (match[1])
                return this.openingBracketBlock(session, match[1], row, i);
                
            var range = session.getCommentFoldRange(row, i + match[0].length, 1);
            
            if (range && !range.isMultiLine()) {
                if (forceMultiline) {
                    range = this.getSectionRange(session, row);
                } else if (foldStyle != "all")
                    range = null;
            }
            
            return range;
        }

        if (foldStyle === "markbegin")
            return;

        var match = line.match(this.foldingStopMarker);
        if (match) {
            var i = match.index + match[0].length;

            if (match[1])
                return this.closingBracketBlock(session, match[1], row, i);

            return session.getCommentFoldRange(row, i, -1);
        }
    };
    
    this.getSectionRange = function(session, row) {
        var line = session.getLine(row);
        var startIndent = line.search(/\S/);
        var startRow = row;
        var startColumn = line.length;
        row = row + 1;
        var endRow = row;
        var maxRow = session.getLength();
        while (++row < maxRow) {
            line = session.getLine(row);
            var indent = line.search(/\S/);
            if (indent === -1)
                continue;
            if  (startIndent > indent)
                break;
            var subRange = this.getFoldWidgetRange(session, "all", row);
            
            if (subRange) {
                if (subRange.start.row <= startRow) {
                    break;
                } else if (subRange.isMultiLine()) {
                    row = subRange.end.row;
                } else if (startIndent == indent) {
                    break;
                }
            }
            endRow = row;
        }
        
        return new Range(startRow, startColumn, endRow, session.getLine(endRow).length);
    };
    
    this.getCommentRegionBlock = function(session, line, row) {
        var startColumn = line.search(/\s*$/);
        var maxRow = session.getLength();
        var startRow = row;
        
        var re = /^\s*(?:\/\*|\/\/)#(end)?region\b/;
        var depth = 1;
        while (++row < maxRow) {
            line = session.getLine(row);
            var m = re.exec(line);
            if (!m) continue;
            if (m[1]) depth--;
            else depth++;

            if (!depth) break;
        }

        var endRow = row;
        if (endRow > startRow) {
            return new Range(startRow, startColumn, endRow, line.length);
        }
    };

}).call(FoldMode.prototype);

});

ace.define("ace/mode/sparql",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/sparql_highlight_rules","ace/mode/folding/cstyle"], function(ace_require, exports, module) {
"use strict";

var oop = ace_require("../lib/oop");
var TextMode = ace_require("./text").Mode;
var SPARQLHighlightRules = ace_require("./sparql_highlight_rules").SPARQLHighlightRules;
var FoldMode = ace_require("./folding/cstyle").FoldMode;

var Mode = function() {
    this.HighlightRules = SPARQLHighlightRules;
    this.foldingRules = new FoldMode();
};
oop.inherits(Mode, TextMode);

(function() {
    this.$id = "ace/mode/sparql"
}).call(Mode.prototype);

exports.Mode = Mode;
});

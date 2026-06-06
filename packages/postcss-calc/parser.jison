/* description: Parses expressions. */

/* lexical grammar */
%lex

%options case-insensitive

%%
\s+                                             /* skip whitespace */

(\-(webkit|moz)\-)?calc\b                       return 'CALC';

[a-z][a-z0-9-]*\s*\((?:(?:\"(?:\\.|[^\"\\])*\"|\'(?:\\.|[^\'\\])*\')|\([^)]*\)|[^\(\)]*)*\)     return 'FUNCTION';

"*"                                             return 'MUL';
"/"                                             return 'DIV';
"+"                                             return 'ADD';
"-"                                             return 'SUB';

(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)em\b              return 'EMS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)ex\b              return 'EXS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)ch\b              return 'CHS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)rem\b             return 'REMS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)vw\b              return 'VWS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)svw\b             return 'SVWS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)lvw\b             return 'LVWS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)dvw\b             return 'DVWS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)vh\b              return 'VHS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)svh\b             return 'SVHS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)lvh\b             return 'LVHS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)dvh\b             return 'DVHS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)vmin\b            return 'VMINS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)svmin\b           return 'SVMINS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)lvmin\b           return 'LVMINS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)dvmin\b           return 'DVMINS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)vmax\b            return 'VMAXS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)svmax\b           return 'SVMAXS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)lvmax\b           return 'LVMAXS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)dvmax\b           return 'DVMAXS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)vb\b              return 'VBS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)svb\b             return 'SVBS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)lvb\b             return 'LVBS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)dvb\b             return 'DVBS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)vi\b              return 'VIS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)svi\b             return 'SVIS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)lvi\b             return 'LVIS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)dvi\b             return 'DVIS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)cqw\b             return 'CQWS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)cqh\b             return 'CQHS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)cqi\b             return 'CQIS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)cqb\b             return 'CQBS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)cqmin\b           return 'CQMINS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)cqmax\b           return 'CQMAXS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)lh\b              return 'LHS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)rlh\b             return 'RLHS';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)cm\b              return 'LENGTH';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)mm\b              return 'LENGTH';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)Q\b               return 'LENGTH';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)in\b              return 'LENGTH';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)pt\b              return 'LENGTH';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)pc\b              return 'LENGTH';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)px\b              return 'LENGTH';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)rpx\b             return 'LENGTH';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)deg\b             return 'ANGLE';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)grad\b            return 'ANGLE';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)rad\b             return 'ANGLE';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)turn\b            return 'ANGLE';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)s\b               return 'TIME';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)ms\b              return 'TIME';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)Hz\b              return 'FREQ';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)kHz\b             return 'FREQ';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)dpi\b             return 'RES';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)dpcm\b            return 'RES';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)dppx\b            return 'RES';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)\%                return 'PERCENTAGE';
(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)\b                return 'NUMBER';
("infinity"|"pi"|"e")\b                                           return 'CALC_KEYWORD';


(([0-9]+("."[0-9]+)?|"."[0-9]+)(e(\+|-)[0-9]+)?)-?([a-zA-Z_]|[\240-\377]|(\\[0-9a-fA-F]{1,6}(\r\n|[ \t\r\n\f])?|\\[^\r\n\f0-9a-fA-F]))([a-zA-Z0-9_-]|[\240-\377]|(\\[0-9a-fA-F]{1,6}(\r\n|[ \t\r\n\f])?|\\[^\r\n\f0-9a-fA-F]))*\b       return 'UNKNOWN_DIMENSION';

"("                                             return 'LPAREN';
")"                                             return 'RPAREN';

<<EOF>>                                         return 'EOF';

/lex

%left ADD SUB
%left MUL DIV
%left UPREC


%start expression

%%

expression
  : math_expression EOF { return $1; }
  ;

  math_expression
    : CALC LPAREN math_expression RPAREN { $$ = $3; }
    | math_expression ADD math_expression { $$ = { type: 'MathExpression', operator: $2, left: $1, right: $3 }; }
    | math_expression SUB math_expression { $$ = { type: 'MathExpression', operator: $2, left: $1, right: $3 }; }
    | math_expression MUL math_expression { $$ = { type: 'MathExpression', operator: $2, left: $1, right: $3 }; }
    | math_expression DIV math_expression { $$ = { type: 'MathExpression', operator: $2, left: $1, right: $3 }; }
    | LPAREN math_expression RPAREN { $$ = { type: 'ParenthesizedExpression', content: $2 }; }
    | function { $$ = $1; }
    | dimension { $$ = $1; }
    | number { $$ = $1; }
    | calc_keyword { $$ = $1; }
    ;

  function
    : FUNCTION { $$ = { type: 'Function', value: $1 }; }
    ;

  dimension
    : LENGTH { $$ = { type: 'LengthValue', value: parseFloat($1), unit: /[a-z]+$/i.exec($1)[0] }; }
    | ANGLE { $$ = { type: 'AngleValue', value: parseFloat($1), unit: /[a-z]+$/i.exec($1)[0] }; }
    | TIME { $$ = { type: 'TimeValue', value: parseFloat($1), unit: /[a-z]+$/i.exec($1)[0] }; }
    | FREQ { $$ = { type: 'FrequencyValue', value: parseFloat($1), unit: /[a-z]+$/i.exec($1)[0] }; }
    | RES { $$ = { type: 'ResolutionValue', value: parseFloat($1), unit: /[a-z]+$/i.exec($1)[0] }; }
    | UNKNOWN_DIMENSION { $$ = { type: 'UnknownDimension', value: parseFloat($1), unit: /[a-z]+$/i.exec($1)[0] }; }
    | EMS { $$ = { type: 'EmValue', value: parseFloat($1), unit: 'em' }; }
    | EXS { $$ = { type: 'ExValue', value: parseFloat($1), unit: 'ex' }; }
    | CHS { $$ = { type: 'ChValue', value: parseFloat($1), unit: 'ch' }; }
    | REMS { $$ = { type: 'RemValue', value: parseFloat($1), unit: 'rem' }; }
    | VHS { $$ = { type: 'VhValue', value: parseFloat($1), unit: 'vh' }; }
    | SVHS { $$ = { type: 'SvhValue', value: parseFloat($1), unit: 'svh' }; }
    | LVHS { $$ = { type: 'LvhValue', value: parseFloat($1), unit: 'lvh' }; }
    | DVHS { $$ = { type: 'DvhValue', value: parseFloat($1), unit: 'dvh' }; }
    | VWS { $$ = { type: 'VwValue', value: parseFloat($1), unit: 'vw' }; }
    | SVWS { $$ = { type: 'SvwValue', value: parseFloat($1), unit: 'svw' }; }
    | LVWS { $$ = { type: 'LvwValue', value: parseFloat($1), unit: 'lvw' }; }
    | DVWS { $$ = { type: 'DvwValue', value: parseFloat($1), unit: 'dvw'  }; }
    | VMINS { $$ = { type: 'VminValue', value: parseFloat($1), unit: 'vmin' }; }
    | SVMINS { $$ = { type: 'SvminValue', value: parseFloat($1), unit: 'svmin' }; }
    | LVMINS { $$ = { type: 'LvminValue', value: parseFloat($1), unit: 'lvmin' }; }
    | DVMINS { $$ = { type: 'DvminValue', value: parseFloat($1), unit: 'dvmin' }; }
    | VMAXS { $$ = { type: 'VmaxValue', value: parseFloat($1), unit: 'vmax' }; }
    | SVMAXS { $$ = { type: 'SvmaxValue', value: parseFloat($1), unit: 'svmax' }; }
    | LVMAXS { $$ = { type: 'LvmaxValue', value: parseFloat($1), unit: 'lvmax' }; }
    | DVMAXS { $$ = { type: 'DvmaxValue', value: parseFloat($1), unit: 'dvmax' }; }
    | VBS { $$ = { type: 'VbValue', value: parseFloat($1), unit: 'vb' }; }
    | SVBS { $$ = { type: 'SvbValue', value: parseFloat($1), unit: 'svb' }; }
    | LVBS { $$ = { type: 'LvbValue', value: parseFloat($1), unit: 'lvb' }; }
    | DVBS { $$ = { type: 'DvbValue', value: parseFloat($1), unit: 'dvb' }; }
    | VIS { $$ = { type: 'VhValue', value: parseFloat($1), unit: 'vi' }; }
    | SVIS { $$ = { type: 'SvhValue', value: parseFloat($1), unit: 'svi' }; }
    | LVIS { $$ = { type: 'LvhValue', value: parseFloat($1), unit: 'lvi' }; }
    | DVIS { $$ = { type: 'DvhValue', value: parseFloat($1), unit: 'dvi' }; }
    | CQWS { $$ = { type: 'CqwValue', value: parseFloat($1), unit: 'cqw' }; }
    | CQHS { $$ = { type: 'CqhValue', value: parseFloat($1), unit: 'cqh' }; }
    | CQIS { $$ = { type: 'CqiValue', value: parseFloat($1), unit: 'cqi' }; }
    | CQBS { $$ = { type: 'CqbValue', value: parseFloat($1), unit: 'cqb' }; }
    | CQMINS { $$ = { type: 'CqminValue', value: parseFloat($1), unit: 'cqmin' }; }
    | CQMAXS { $$ = { type: 'CqmaxValue', value: parseFloat($1), unit: 'cqmax' }; }
    | LHS { $$ = { type: 'LhValue', value: parseFloat($1), unit: 'lh' }; }
    | RLHS { $$ = { type: 'RlhValue', value: parseFloat($1), unit: 'rlh' }; }
    | PERCENTAGE { $$ = { type: 'PercentageValue', value: parseFloat($1), unit: '%' }; }
    | ADD dimension { var prev = $2; $$ = prev; }
    | SUB dimension { var prev = $2; prev.value *= -1; $$ = prev; }
    ;

  calc_keyword
    : CALC_KEYWORD { $$ = { type: 'CalcKeyword', value: $1 }; }
    ;

  number
    : NUMBER { $$ = { type: 'Number', value: parseFloat($1) }; }
    | ADD NUMBER { $$ = { type: 'Number', value: parseFloat($2) }; }
    | SUB NUMBER { $$ = { type: 'Number', value: parseFloat($2) * -1 }; }
    ;

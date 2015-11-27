/*jshint quotmark:double */
"use strict";

angular.module("layoutmodel")

.constant("LayoutModelTpl", " <script type=\"text/ng-template\" id=\"defaultTitle.html\">   <div class=\"title-value\">{{ superHeader.Label || innerTitle.CellLabels[labelidx] || innerTitle.CellLabels[0] }}</div>  </script>  <script type=\"text/ng-template\" id=\"defaultData.html\">   <div class=\"value\">     <span class=\"data-value\" ng-bind-html=\"showValue(data)\"></span><span ng-if=\"showMoreLink(data)\" class=\"morelink\"><a ng-click=\"showDetails($event, data)\">[more]</a></span>         <span ng-if=\"checks\" class=\"validation\"><i ng-show=\"data.Valid == false\" class=\"fa fa-times invalid\"></i><i ng-show=\"data.Valid\" class=\"fa fa-check valid\"></i></span>   </div>              </script>    <script type=\"text/ng-template\" id=\"defaultHeader.html\">   {{ header.CellLabels[labelidx] || header.CellLabels[0] || \" \" }}  </script>   <table ng-show=\"layoutModel && xHeaderGroups && xHeaderGroups.length > 0 && yHeaderGroups && yHeaderGroups.length>0\" class=\"rendering\" ng-class=\"tableClass()\">   <thead ng-if=\"layoutModel.ComponentAndHypercubeInformation\">      <tr class=\"constraints\">       <td class=\"header networkandtable\" colspan=\"{{ (yHeaderGroups[0].length + data[0].length )}}\">Component: (Network and Table)</td>             <td class=\"closing-border\"></td>     </tr>     <tr class=\"constraints\">       <td class=\"headerlabel\" colspan=\"{{yHeaderGroups[0].length}}\">Network</td>       <td class=\"headervalue\" colspan=\"{{data[0].length}}\"><span class=\"componentlabel\">{{ layoutModel.ComponentAndHypercubeInformation.Component.Label  }}</span>        <div class=\"componenturl\">( {{ layoutModel.ComponentAndHypercubeInformation.Component.Role  }} )</div>       </td>       <td class=\"closing-border\"></td>     </tr>     <tr class=\"constraints\">       <td class=\"headerlabel\" colspan=\"{{yHeaderGroups[0].length}}\">Table</td>       <td class=\"headervalue hypercubelabel\" colspan=\"{{data[0].length}}\">{{ layoutModel.ComponentAndHypercubeInformation.Hypercube.Label  }}</td>       <td class=\"closing-border\"></td>     </tr>     <tr class=\"space\">       <td colspan=\"{{yHeaderGroups[0].length}}\"></td>       <td colspan=\"{{data[0].length}}\"></td>       <td class=\"closing-border\"></td>     </tr>   </thead>   <tbody ng-if=\"constraints == true\" ng-show=\"hasConstraints()\">     <tr class=\"constraints\" ng-repeat=\"pair in layoutModel.GlobalConstraints\">       <td class=\"constraintlabel\" colspan=\"{{yHeaderGroups[0].length}}\">{{ getConstraintLabel(pair) }}</td>       <td class=\"constraintvalue\" colspan=\"{{data[0].length}}\">{{ getConstraintValue(pair) }}</td>       <td class=\"closing-border\"></td>     </tr>      <tr class=\"space\">        <td colspan=\"{{yHeaderGroups[0].length}}\"></td>        <td colspan=\"{{data[0].length}}\"></td>        <td class=\"closing-border\"></td>      </tr>    </tbody>    <!-- ###### The main table ###### -->   <tbody>       <tr ng-repeat=\"headerGroup in xHeaderGroups\"           ng-class=\"{ 'last-column-header-row' : $last, 'first-column-header-row' : $first }\">          <!-- top left corner header cell -->         <td ng-repeat=\"superHeader in ySuperHeaders | displaySuperColumnHeader:$index\"             class=\"header title\"             colspan=\"{{superHeader.ColSpan}}\" rowspan=\"{{xHeaderGroups.length}}\">{{superHeader.Label}}</td>          <!-- top header row -->         <td class=\"header column-header\" ng-class=\"{ xrollup : header.RollUp }\"             ng-click=\"headerclick({header : header, axis:'x' });\"             ng-repeat=\"header in headerGroup\" colspan=\"{{header.CellSpan}}\" ng-include=\"headerTemplate\">         </td>          <td class=\"closing-border\"></td>       </tr>       <tr ng-repeat=\"headerGroup in yHeaderGroups\"           ng-class=\"rowHeaderClasses(headerGroup[0], $first)\">          <!-- left row headers -->         <td ng-repeat=\"header in headerGroup\"             class=\"header row-header\"             ng-class=\"rowColHeaderClasses(header, $first)\"             ng-click=\"headerclick({header : header, axis:'y' });\"             ng-show=\"isVisible(header)\"             colspan=\"{{headerColSpan(headerGroup, $index)}}\"             rowspan=\"{{header.CellSpan}}\" ng-include=\"headerTemplate\">         </td>          <!-- data cells -->         <td class=\"data\" ng-click=\"dataclick({ data : data })\" ng-class=\"classes(data, headerGroup[headerGroup.length - 1])\" ng-repeat=\"data in data[$index] track by $index\" ng-include=\"dataTemplate\">         </td>          <td class=\"closing-border\"></td>       </tr>       <tr class=\"space\">        <td colspan=\"{{yHeaderGroups[0].length}}\"></td>        <td colspan=\"{{data[0].length}}\"></td>        <td class=\"closing-border\"></td>       </tr>    </tbody> </table> </div> ")

.constant("FactDetailTpl", " <div class=\"modal-body\">   <p ng-show=\"facts.length > 1\">{{ facts.length }} facts:</p>   <div ng-repeat=\"fact in facts\">     <span ng-bind-html=\"showValue(fact, true)\"></span>   </div>  </div>  <div class=\"modal-footer\">     <button class=\"btn btn-primary\" ng-click=\"ok()\">Close</button>     </div>")

;
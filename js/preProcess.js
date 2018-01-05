
var newLineArray = [],
    newMarkerArray = [],
    barChartData = [],
    chartSeries = [],
    ODTableData = [],
    tempArrayData = [],
    nodeNameXY = [],
    nodeNameArray = [],
    temp_ODTable = [],
    tempTotal_Node= [];

var hiLineArray = [],
    hiLightTitle = "",
    hiLightMarker = "",
    L_data=[],
    M_data=[],
    RateChart=[];

var Leaflet_Line = [],
    Leaflet_Marker = [];

var indexDiff=[],
    loadIndexArr=[],
    loadDataIndex=[];

function resetAllSetting(){
  hiLightTitle = "";
  d3.select('#rateChartTitle').html("Entrance Rate");
  newLineArray = [];
  newMarkerArray = [];
  barChartData = [];
  chartSeries = [];
  ODTableData = [];
  nodeNameXY = [];
  nodeNameArray = [];
  temp_ODTable = [];
  tempTotal_Node= [];
  removeAllMapElement();
  RateChart.load({
        columns: [['data', 50.0]]
  });
}

function removeAllMapElement(){
  Leaflet_Line.map((_LC)=>{
    _LC.remove();
  });
  Leaflet_Marker.map((_LM)=>{
    _LM.remove();
  });
  hiLineArray.map((_HL)=>{
    _HL.remove();
  });
  if(hiLightMarker!=""){
    hiLightMarker.remove();
  }
}

function callFilterData(selectorID){
  var sel = document.getElementById(selectorID);
  var _val = sel.options[sel.selectedIndex].value;
  loadDataIndex[selectorID] = [_val];
  resetAllSetting();
  var LBD = LoadCSVData( colorHeatMapSet2);
  if(LBD.newLineArray.length>0){
    barChartData=processOD(LBD.temp_OD);
    barChartData[""]={};
    newMarkerArray = processMarker(LBD.nodeNameArray,LBD.nodeNameXY,LBD.enter_Number,LBD.exit_Number);
    console.log(newMarkerArray);
    initLine(LBD.newLineArray , map);
    initMarker(newMarkerArray , map);
  }else{
    alert("Error selector");
  }
  // initGaugeChart(map);
}

function MakeSelectorArea(loadIndexArr){
  var main_ele="<div class='form-row'>";
  for(sel_ele in loadIndexArr){
    var ele_str = "<div class='col input-group'><div class='input-group-prepend'>"+
    "<label class='input-group-text' for='"+sel_ele+"'>"+sel_ele+"</label></div>"+
    "<select id='"+sel_ele+"' class='form-control' onchange=\"callFilterData('"+sel_ele+"')\">";
    loadIndexArr[sel_ele].map((_val)=>{
      ele_str+="<option value='"+_val+"'>"+_val+"</option>";
    });
    ele_str+="</select></div>";
    main_ele+=ele_str;
  }
  main_ele+="</div>";
  d3.select("#mainType").html(main_ele);
}

function PreCSVDaInit(index_diff, color4LineSet){
  indexDiff = index_diff;
  // log first record 
  var fisrtRecord = tempArrayData[0];
  // inin loadIndexArr
  index_diff.map((_index)=>{
    loadIndexArr[_index]=["all"];
    loadDataIndex[_index]=["all"];
  });
  for (_index in fisrtRecord) {
    if (fisrtRecord.hasOwnProperty(_index)) {  
      if(index_diff.indexOf(_index)>-1){
        loadIndexArr[_index].push(fisrtRecord[_index])
      }
    }
  }
  tempArrayData.map((_line,i)=> {
    for (_index in loadIndexArr) {
      if(loadIndexArr[_index].indexOf(_line[_index])==-1){
        loadIndexArr[_index].push(_line[_index]);
      }
    }
  });
  MakeSelectorArea(loadIndexArr);
}

function FilterCheck(_line){
  var indexkey=true;
  if(_line['o']!=_line['d']){
    indexDiff.map((_index)=>{
      if(! ((loadDataIndex[_index]=="all" || _line[_index]==loadDataIndex[_index]) && indexkey==true)){
        indexkey = false;
      }
    });
    return indexkey;
  }else{
    return false;
  }
}

function LoadCSVData(color4LineSet){
  var exit_Number={},
      enter_Number = {};
  var temp_OD = [],
      nodeNameArray = [],
      nodeNameXY = [];
  var numberOfLineColor = color4LineSet.length;
  var maxLineNumber = 0;
  var minLineNumber = 99999999;
  tempArrayData.map((_line,i)=> {
    if( FilterCheck(_line)){
      var cnt = parseInt(_line.cnt);
      if (!(_line.o in exit_Number)){
        exit_Number[_line.o]=cnt;
      }else{
        exit_Number[_line.o]+=cnt;
      }

      if (!(_line.d in enter_Number)){
        enter_Number[_line.d]=cnt;
      }else{
        enter_Number[_line.d]+=cnt;
      }
      if (nodeNameArray.indexOf(_line.o)==-1){
        nodeNameArray.push(_line.o);
        nodeNameXY[_line.o] = {x: _line.x1, y: _line.y1};
      }
      if (nodeNameArray.indexOf(_line.d)==-1){
        nodeNameArray.push(_line.d);
        nodeNameXY[_line.d] = {x: _line.x2, y: _line.y2};
      }
      if (!(_line.o in temp_OD)){
          temp_OD[_line.o]=[];
          temp_OD[_line.o][_line.d]=[];
          temp_OD[_line.o][_line.d]['exit']=cnt;
      }else if (!(_line.d in temp_OD[_line.o])){
          temp_OD[_line.o][_line.d]=[];
          temp_OD[_line.o][_line.d]['exit']=cnt;
      }else if (temp_OD[_line.d][_line.o]['enter']>0){
          temp_OD[_line.o][_line.d]['exit']+=cnt;
      }else{
          temp_OD[_line.o][_line.d]['exit']=cnt;
      }

      if (!(_line.d in temp_OD)){
          temp_OD[_line.d]=[]
          temp_OD[_line.d][_line.o]=[];
          temp_OD[_line.d][_line.o]['enter']=cnt;
      }else if (!(_line.o in temp_OD[_line.d])){
          temp_OD[_line.d][_line.o]=[];
          temp_OD[_line.d][_line.o]['enter']=cnt;
      }else if (temp_OD[_line.d][_line.o]['enter']>0){
          temp_OD[_line.d][_line.o]['enter']+=cnt;
      }else{
          temp_OD[_line.d][_line.o]['enter']=cnt;
      }
    }
  });

  for (_O in temp_OD){
    for (_D in temp_OD[_O]){
      var tempMax = 0;
      var tempMin = 99999999;
      if ('enter' in temp_OD[_O][_D] && 'exit' in temp_OD[_O][_D]){
        if(temp_OD[_O][_D]['enter'] > temp_OD[_O][_D]['exit']){
          tempMax=temp_OD[_O][_D]['enter'];
          tempMin=temp_OD[_O][_D]['exit'];
        }else{
          tempMax=temp_OD[_O][_D]['exit'];
          tempMin=temp_OD[_O][_D]['enter'];
        }
      }else if('enter' in temp_OD[_O][_D]){
        tempMax=temp_OD[_O][_D]['enter'];
        tempMin=temp_OD[_O][_D]['enter'];
      }else if('exit' in temp_OD[_O][_D]){
        tempMax=temp_OD[_O][_D]['exit'];
        tempMin=temp_OD[_O][_D]['exit'];
      }
      maxLineNumber = (tempMax > maxLineNumber) ? tempMax : maxLineNumber;
      minLineNumber = (tempMin < minLineNumber) ? tempMin : minLineNumber;
    }
  }
  // process of line
  if(maxLineNumber>minLineNumber){
    var color_d = Math.floor((maxLineNumber-minLineNumber)/numberOfLineColor);
    CreateLineColorRange(color_d,color4LineSet)
    var weight_d = Math.floor((maxLineNumber-minLineNumber)/10);
    tempArrayData.map((_line)=> {
      if(_line.o!=_line.d){
        var cnt = temp_OD[_line.o][_line.d]['exit'];
        var colorIndex = ((cnt-minLineNumber)-((cnt-minLineNumber)%color_d))/color_d-1;
        if(colorIndex<0 && cnt>0){
          colorIndex=0;
        }
        var weightIndex = ((cnt-minLineNumber)-((cnt-minLineNumber)%weight_d))/weight_d;
        weightIndex = cnt == 0 ? 0 : weightIndex;
        if(weightIndex>0){
          newLineArray.push({o:_line.o,d:_line.d,x1:_line.x1,y1:_line.y1,x2:_line.x2,y2:_line.y2,cnt:cnt,color:color4LineSet[colorIndex],weight:weightIndex});
        }
      }
    });
  }
  console.log(enter_Number);
  console.log(exit_Number);
  return ({
    'newLineArray': newLineArray,
    'temp_OD': temp_OD,
    'nodeNameArray' : nodeNameArray,
    'nodeNameXY': nodeNameXY,
    'enter_Number': enter_Number,
    'exit_Number': exit_Number,
  });
}


function processMarker(nodeNameArray,nodeNameXY,enter_Number,exit_Number){
  var maxNodeNumber = 0;
  var minNodeNumber = 99999999;
  var tempTotal_Node = [];
  nodeNameArray.map((_node)=> {
    var enterN = (_node in enter_Number) ? enter_Number[_node] : 0;
    var exitN = (_node in exit_Number) ? exit_Number[_node] : 0;
    var totalN = (exitN+enterN)
    tempTotal_Node.push({
      noName: _node,
      x:nodeNameXY[_node]['x'],
      y:nodeNameXY[_node]['y'],
      enter: enterN,
      exit: exitN,
      total: totalN
    });
      maxNodeNumber = (totalN > maxNodeNumber) ? totalN : maxNodeNumber;
      minNodeNumber = (totalN < minNodeNumber) ? totalN : minNodeNumber;
  });
  var weight_n = Math.round((maxNodeNumber-minNodeNumber)/50);
  tempTotal_Node.map((_node) => {
    var radiusIndex = ((_node.total-minNodeNumber)-((_node.total-minNodeNumber)%weight_n))/weight_n
    radiusIndex = _node.total==0 ? 0 : radiusIndex;
    if(radiusIndex>0){
      newMarkerArray.push({
        noName: _node['noName'], 
        x : _node['x'], 
        y : _node['y'], 
        enter : _node['enter'], 
        exit : _node['exit'],
        total : _node['total'],
        color : "#666",
        radius : radiusIndex
      });
    }
  });
  // return ({
  //   'tempTotal_Node' : tempTotal_Node,
  //   'newMarkerArray' : newMarkerArray
  // });  
  return newMarkerArray;
}

function processOD(temp_OD){
  barChartData=[];
  for (var _oneNode in temp_OD){
    barChartData[_oneNode]=[];
    for (var _twoNode in temp_OD[_oneNode]){
      if (temp_OD[_oneNode][_twoNode]['exit']>0 || temp_OD[_oneNode][_twoNode]['enter']>0){
        var ctotalNum = temp_OD[_oneNode][_twoNode]['exit']+temp_OD[_oneNode][_twoNode]['enter']
        barChartData[_oneNode].push({zone : _twoNode , exit : temp_OD[_oneNode][_twoNode]['exit'] , enter : temp_OD[_oneNode][_twoNode]['enter'], totalN : ctotalNum})
      }
    }
  }
  return barChartData;
}

function initLineLevel(map){
  var LineContents = ["<div id='colorRange'>",
                      "<div class='lineRangeList'><div class='lineRangeColor' style='background-color:#AED581;'></div><code>1 - 72</code></div><div class='lineRangeList'><div class='lineRangeColor' style='background-color:#9CCC65;'></div><code>73 - 144</code></div><div class='lineRangeList'><div class='lineRangeColor' style='background-color:#8BC33A;'></div><code>145 - 216</code></div><div class='lineRangeList'><div class='lineRangeColor' style='background-color:#7CB342;'></div><code>217 - 288</code></div><div class='lineRangeList'><div class='lineRangeColor' style='background-color:#FFEB3B;'></div><code>289 - 360</code></div><div class='lineRangeList'><div class='lineRangeColor' style='background-color:#FDD835;'></div><code>361 - 432</code></div><div class='lineRangeList'><div class='lineRangeColor' style='background-color:#FBC02D;'></div><code>433 - 504</code></div><div class='lineRangeList'><div class='lineRangeColor' style='background-color:#FF8A65;'></div><code>505 - 576</code></div><div class='lineRangeList'><div class='lineRangeColor' style='background-color:#FF7043;'></div><code>577 - 648</code></div><div class='lineRangeList'><div class='lineRangeColor' style='background-color:#FF5722;'></div><code>649 - 720</code></div>",
                      "</div>"].join('');
  var dialog4line = L.control.dialog()
            .setContent(LineContents)
            .addTo(map);

  dialog4line.setLocation([0, 0]);
  dialog4line.freeze();
  dialog4line.setSize([ 200, 330]);
  dialog4line.hideClose();
}
function CreateLineColorRange(color_duration,color4LineSet){
  var colorRangeHtml = "";
  var pre_max = 0;
  color4LineSet.map((_color,i)=>{
    var st = pre_max+1;
    var ed = st+color_duration;
    pre_max = ed;
    colorRangeHtml+="<div class='lineRangeList'><div class='lineRangeColor' style='background-color:"+_color+";'></div><code>"+st+" - "+ed+"</code></div>";
  });
  d3.select('#colorRange').html(colorRangeHtml);
}

function initGaugeChart(map){
  var rateContents = ["<div id='rateChartTitle' class='rateChart'>Entrance Rate</div>",
                      "<div id='rateChart'></div>"].join('');
  var dialog = L.control.dialog({position:'topright'})
            .setContent(rateContents)
            .addTo(map);

  dialog.setLocation([0, -290]);
  dialog.freeze();
  dialog.setSize([ 280, 180]);
  dialog.hideClose();
  RateChart = c3.generate({
      bindto: '#rateChart',
      data: {
          columns: [
              ['data', 50.0]
          ],
          type: 'gauge',
      },
      gauge: {
         label: {
             format: function(value, ratio) {
                 return value;
             },
         },
     units: '%',
     width: 50
      },
      color: {
          pattern: ['#FF0000', '#F97600', '#F6C600', '#60B044'], // the three color levels for the percentage values.
          threshold: {
              values: [30, 60, 90, 100]
          }
      },
      size: {
          height: 120,
      }
  });
}

function ChangeGaugeChart(_Marker){
  if(_Marker['noName']==hiLightTitle){
    d3.select('#rateChartTitle').html(" [ "+_Marker['noName']+" ] Entrance Rate");
    var _rate = (_Marker['enter']/_Marker['total']*100).toFixed(1);
  }else{
    d3.select('#rateChartTitle').html("Entrance Rate");
    var _rate = 50.0;
  }
  RateChart.load({
        columns: [['data', _rate]]
  });
}

function callC3Chart(title){
  var x = [];
  var enter = ["enter"];
  var exit = ["exit"];
  if(hiLightTitle!=""){
    barChartData[hiLightTitle].map((_data)=>{
      x.push(_data['zone']);
      enter.push(_data['enter']);
      exit.push(_data['exit']);
    });
    var _columns = [enter,exit];
    c3.generate({
        bindto: '#chart',
        data: {
            columns: _columns,
            type: 'bar',
            groups: [
                ['enter', 'exit']
            ],
            names: {
              enter: '進人數',
              exit: '出人數'
            },
            colors:{
              enter :'#1E90FF',
              exit : '#87CEFA'
            }
        },
        axis: {
            x: {
                type: 'category',
                categories: x
            }
        }

    });
  }else{
    d3.select('#chart').html("請選擇一個行政區");
  }
}

function initLine(lineArray,_map){
  L_data=lineArray;
  lineArray.map((_line)=>{
    var tempL_L = drawLineFunc(_line);
    Leaflet_Line.push(tempL_L);
    tempL_L.addTo(_map);
  });
}

function drawLineFunc(_line){
  var x1 = parseFloat(_line['x1']),
      y1 = parseFloat(_line['y1']),
      x2 = parseFloat(_line['x2']),
      y2 = parseFloat(_line['y2']),
      _color = _line['color'],
      _weitht = _line['weight'];
  var y3=((y2-y1)*0.5)+y1;
  var x3=((x2-x1)*0.5)+x1;
  var tmpPath= ['M',[y1,x1],
                'C',[y3,x1],
                    [y2,x3],
                    [y2,x2]];
  return L.curve(tmpPath,{color:_color,weight:_weitht});
}


function HightLineFunc(_line){
  var x1 = parseFloat(_line['x1']),
      y1 = parseFloat(_line['y1']),
      x2 = parseFloat(_line['x2']),
      y2 = parseFloat(_line['y2']),
      _color = "#708090",
      _weitht = _line['weight'];
  var y3=((y2-y1)*0.5)+y1;
  var x3=((x2-x1)*0.5)+x1;
  var tmpPath= ['M',[y1,x1],
                'C',[y3,x1],
                    [y2,x3],
                    [y2,x2]];
  return L.curve(tmpPath,{color:_color,weight:_weitht, dashArray: 25, animate: {duration: 10000, iterations: Infinity}});
}

function LineHiLightProcess(_map , title){
  hiLineArray.map((_LC)=>{
    _LC.remove();
  });
  hiLineArray=[];
  if(hiLightTitle!=title){
    hiLightTitle=title;
    L_data.map((_line)=>{
      if(_line['o']==title || _line['d']==title){
        var LC = HightLineFunc(_line);
        LC.addTo(_map);
        hiLineArray.push(LC);
      }
    });
  }else{
    hiLightTitle="";
  }
}


function MarkerHiLightProcess(_marker){
  var _enter= _marker['enter'],
      _exit= _marker['exit'],
      _total= _marker['total'];
  
  var tmp_marker = L.circleMarker([_marker['y'],_marker['x']],{
    title: _marker['noName'],
    radius: _marker['radius'],
    fillColor: "#708090",
    fillOpacity: '0.9',
    opacity: '0.3' ,
    color:'#333',
    weight:'1'})
  return tmp_marker;
}


function HiLightFunc(_map,  title){
  LineHiLightProcess(_map, title);
  var HiMarker = MarkerHiLightProcee(_map , title);
  console.log(HiMarker)
  callC3Chart(title);
  ChangeGaugeChart(HiMarker);
}

function MarkerHiLightProcee(_map , title){
  if(hiLightMarker!=""){
    hiLightMarker.remove();
  }
  var HiMarker = [];
  M_data.map((_marker)=>{
    if(_marker['noName']==title && hiLightTitle==title){
      var _LM = MarkerHiLightProcess(_marker);
      _LM.addTo(_map).on('click' ,L.bind(HiLightFunc, null, _map , _marker['noName']));
      hiLightMarker = _LM;
      HiMarker=_marker
    }
  });
  return HiMarker;
}

function initMarker(markerArray , _map){
  M_data=markerArray;
  markerArray.map((_marker)=>{
    var tempL_M = drawMarkerFunc(_marker)
    Leaflet_Marker.push(tempL_M);
    tempL_M.addTo(_map).on('click' ,L.bind(HiLightFunc, null, _map , _marker['noName']));
  });
}


function drawMarkerFunc(_marker){
  var _x = _marker['x'],
      _y = _marker['y'],
      _radius = _marker['radius'],
      _fillColor= "#ccc",
      _enter= _marker['enter'],
      _exit= _marker['exit'],
      _total= _marker['total'];
  
  var popupHTML = "<div class='popupMap'>"+_marker['noName']+"</div>";
	var tmp_marker = L.circleMarker([_y,_x],{
    title: _marker['noName'],
		radius:_radius,
    fillColor: _fillColor,
    fillOpacity: '0.4',
    opacity: '0.3' ,
		color:'#333',
    weight:'1'})
	tmp_marker.bindPopup(popupHTML);
	return tmp_marker;
}



var hiLineArray = [],
    hiLightTitle = "",
    hiLightMarker = "",
    L_data=[],
    M_data=[],
    RateChart=[];


function LoadCSVData(tempArrayData , color4LineSet){
  var exit_Number={},
      enter_Number = {};
  var temp_OD = [],
      nodeNameArray = [],
      nodeNameXY = [];
  var numberOfLineColor = color4LineSet.length;
  var maxLineNumber = 0;
  var minLineNumber = 99999999;
  tempArrayData.map((_line)=> {

    if(_line.o!=_line.d && _line.ftime=="8"){
      var cnt = parseInt(_line.cnt);
      maxLineNumber = (cnt > maxLineNumber) ? cnt : maxLineNumber;
      minLineNumber = (cnt < minLineNumber) ? cnt : minLineNumber;
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
        nodeNameXY[_line.o] = {x: _line.x1,y: _line.y1};
      }
      if (nodeNameArray.indexOf(_line.d)==-1){
        nodeNameArray.push(_line.d);
        nodeNameXY[_line.d] = {x: _line.x2,y: _line.y2};
      }
      if (!(_line.o in temp_OD)){
          temp_OD[_line.o]=[]
          temp_OD[_line.o][_line.d]=[]
          temp_OD[_line.o][_line.d]['exit']=parseInt(_line.cnt)
      }else if (!(_line.d in temp_OD[_line.o])){
          temp_OD[_line.o][_line.d]=[]
          temp_OD[_line.o][_line.d]['exit']=parseInt(_line.cnt)
      }else{
          temp_OD[_line.o][_line.d]['exit']=parseInt(_line.cnt)
      }

      if (!(_line.d in temp_OD)){
          temp_OD[_line.d]=[]
          temp_OD[_line.d][_line.o]=[]
          temp_OD[_line.d][_line.o]['enter']=parseInt(_line.cnt)
      }else if (!(_line.o in temp_OD[_line.d])){
          temp_OD[_line.d][_line.o]=[]
          temp_OD[_line.d][_line.o]['enter']=parseInt(_line.cnt)
      }else{
          temp_OD[_line.d][_line.o]['enter']=parseInt(_line.cnt)
      }
    }
  });

  // process of line
  var color_d = Math.round((maxLineNumber-minLineNumber)/numberOfLineColor+1);
  var weight_d = Math.round((maxLineNumber-minLineNumber)/10);
  tempArrayData.map((_line)=> {
    var colorIndex = ((_line.cnt-minLineNumber)-((_line.cnt-minLineNumber)%color_d))/color_d
    var weightIndex = ((_line.cnt-minLineNumber)-((_line.cnt-minLineNumber)%weight_d))/weight_d
    weightIndex = _line.cnt == 0 ? 0 : weightIndex;
    if(weightIndex>0){
      newLineArray.push({o:_line.o,d:_line.d,x1:_line.x1,y1:_line.y1,x2:_line.x2,y2:_line.y2,cnt:_line.cnt,color:color4LineSet[colorIndex],weight:weightIndex});
    }
  });
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
  // console.log(nodeNameXY);
  // process of marker 
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

function initGaugeChart(){
  var rateContents = ["<div class='rateChart'>進入量比</div>",
                      "<div id='rateChart'></div>"].join('');

  var dialog = L.control.dialog()
            .setContent(rateContents)
            .addTo(map);

  dialog.setLocation([10,1130]);
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
        // onclick: function (d, i) { console.log("onclick", d, i); },
        // onmouseover: function (d, i) { console.log("onmouseover", d, i); },
        // onmouseout: function (d, i) { console.log("onmouseout", d, i); }
    },
    gauge: {
       label: {
           format: function(value, ratio) {
               return value;
           },
           // show: false // to turn off the min/max labels.
       },
//    min: 0, // 0 is default, //can handle negative min e.g. vacuum / voltage / current flow / rate of change
//    max: 100, // 100 is default
   units: '%',
   width: 50 // for adjusting arc thickness
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
    var _rate = (_Marker['enter']/_Marker['total']*100).toFixed(1);
  }else{
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
    console.log("123");
    d3.select('#chart').html("請選擇一個行政區");
    // $("#chart")
  }
}

function initLine(lineArray,_map){
  L_data=lineArray;
  lineArray.map((_line)=>{
    drawLineFunc(_line).addTo(_map);
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
  markerArray.map((_marker)=>{
    drawMarkerFunc(_marker).addTo(_map).on('click' ,L.bind(HiLightFunc, null, _map , _marker['noName']));
  });
  M_data=markerArray;
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



function old_drawCircleMarker(_x,_y,_radius=3,_fillColor='green',tip='this is a tip'){
  _radius=_radius*mapZoomLevel
  tmp_marker = L.circleMarker([_x,_y],{
    radius:_radius,
    fillColor: _fillColor,
    color:'#666666',
    weight:'0'})
  tmp_marker.bindTooltip(tip)
  return tmp_marker
}


function old_drawOneline(x1,y1,x2,y2,_color='#000',_weight=2){
  pathMK = L.curve(['M',[x1,y1],
            'Q',[x1,y2],
                [x2,y2]],{color:_color,weight:_weight})
  return pathMK
}
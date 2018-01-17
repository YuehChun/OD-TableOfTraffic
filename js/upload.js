// make dataset globally available
var dz;
function arr_diff (a1, a2) {
    var a = [], diff = [];
    for (var i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
    }
    for (var i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        } else {
            a[a2[i]] = true;
        }
    }
    for (var k in a) {
        diff.push(k);
    }
    return diff;
}

// load dataset and create table
function load_dataset(csv) {
  resetAllSetting();
  tempArrayData=d3.csv.parse(csv);
  var csvKey = Object.keys(tempArrayData[0]);

  if(csvKey.includes('x1') && csvKey.includes('y1') && csvKey.includes('x2') && csvKey.includes('y2') && csvKey.includes('o') && csvKey.includes('d') && csvKey.includes('cnt')){
    var index_diff = arr_diff(csvKey,['x1','y1','x2','y2','o','d','cnt']);
    preLoadProcess(index_diff);
  }else{
    alert("Error data!!");
  }
}

function preLoadProcess(index_diff){
    PreCSVDaInit( index_diff, colorHeatMapSet2);
    var LBD = LoadCSVData(colorHeatMapSet2);
    if(LBD.newLineArray.length>0){
      barChartData=processOD(LBD.temp_OD);
      barChartData[""]={};
      newMarkerArray = processMarker(LBD.nodeNameArray,LBD.nodeNameXY,LBD.enter_Number,LBD.exit_Number);
      initLine(LBD.newLineArray , map);
      initMarker(newMarkerArray , map);
    }else{
      alert("Error selector");
    }
}


// handle upload button
function upload_button(el, callback) {
  var uploader = document.getElementById(el);  
  var reader = new FileReader();

  reader.onload = function(e) {
    var contents = e.target.result;
    callback(contents);
  };

  uploader.addEventListener("change", handleFiles, false);  

  function handleFiles() {
    // d3.select("#table").text("loading...");
    var file = this.files[0];
    reader.readAsText(file);
  };
};
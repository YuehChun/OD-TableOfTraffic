# OD Table in Traffic Visualization(視覺化起訖旅次表)
> This is an application for Origin Destination Table Visualization in Traffic. Base on JavaScript. 

![Demo snapshot](/ODTableOfTraffic.gif)


Demo for taipei traffic (Case by using Xinyi Road at 7 am ~ 9 am ). 
[Check out the Demo Here](https://yuehchun.github.io/TrafficODTableVis)


Entrance Rate
-------------
Selected district `Entrance Rate`

`input` = sum of value for Enter( Selected district )

`output` = sum of value for Exit( Selected district )

`Entrance Rate` = `input` / (`input` + `output`)


![Full Screen](/images/entranceRate.png)



Color level of line
-------------------

![Full Screen](/images/colorLine.png)


Number of Enter & Exit
-------------------
Number of Enter & Exit with each district.

![Full Screen](/images/numberOfData.png)


Full Screen
-----------

( bottom right on map)
Click this ![Full Screen](/images/fullScreen.png) !!! 

JavaScript library
------------------------
* ![Leaflet](https://github.com/Leaflet/Leaflet)
* ![D3js](https://github.com/d3/d3)
* ![C3js](https://github.com/c3js/c3)
* ![Leaflet Curve](https://github.com/elfalem/Leaflet.curve)
* ![Leaflet Dialog](https://github.com/NBTSolutions/Leaflet.Dialog)


License
--------
MIT
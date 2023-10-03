looker.plugins.visualizations.add({

 /**
  * Configuration options for your visualization. In Looker, these show up in the vis editor
  * panel but here, you can just manually set your default values in the code.
  **/
  options: {
  },

 /**
  * The create function gets called when the visualization is mounted but before any
  * data is passed to it.
  **/
  create: function(element, config){
    // element.innerHTML = "<div style=\"display:block; height: 100%; width: 100%;\" id=\"road-map-container\"></div>";
  },

 /**
  * UpdateAsync is the function that gets called (potentially) multiple times. It receives
  * the data and should update the visualization with the new data.
  **/
  updateAsync: function(data, element, config, queryResponse, details, doneRendering){
    var allSeries = [];
    var categoricals = [];
    var seriesLabels = [];

    var baseSeries = [];
    var progressSeries = [];
    var colors = [ '#15FF33AA', '#FF780DAA', '#AEC8C1AA', '#0CA8FFAA', '#C0D918AA', '#92CF50AA', '#49CEC0AA', '#0DADBDAA'];

    for (const [rowNum, row] of data.entries()) {
      color = colors[rowNum % colors.length];
      var rec = Object.values(row);
      var seriesLabel = rec[1].value;

      seriesLabels.push(seriesLabel);
      categoricals.push(rec[0].value)

      console.log(LookerCharts.Utils.htmlForCell(rec[0].value))

      if (baseSeries[seriesLabel] == undefined) {
        baseSeries[seriesLabel] = [];
      }

      baseSeries[seriesLabel].push({
        //color: color,
        low: Date.parse(rec[2].value),
        high: Date.parse(rec[3].value),
        x: categoricals.length - 1,
        id: rec[1].value,
        name: rec[1].value,
        dataLabels: {
          enabled: false,
        }
      })

      if (progressSeries[seriesLabel] == undefined) {
        progressSeries[seriesLabel] = [];
      }

      progressSeries[seriesLabel].push({
        color: '#00000033',
        low: Date.parse(rec[2].value),
        high: Date.parse(rec[2].value)+(rec[4].value/100)*((Date.parse(rec[3].value)-Date.parse(rec[2].value))),
        x: categoricals.length - 1,
        id: rec[1].value,
        name: rec[1].value,
        percentage: rec[4].value,
      })

    }

    function onlyUnique(value, index, array) {
      return array.indexOf(value) === index;
    }

    var seriesLabels = seriesLabels.filter(onlyUnique);

    for (const [id, label] of seriesLabels.entries()) {
      color = colors[id % colors.length];

      var series1 =   {
          color: color,
          index: id,
          name: label,
          type: 'columnrange',
          centerInCategory: true,
          grouping: false,
          animation: false,
          backgroundColor: 'rgba(0, 0, 0, 0)',
          inverted: true,
          spacingBottom: 0,
          spacingRight: 0,
          spacingLeft: 0,
          style: {
            fontFamily: 'inherit',
          },
          dataLabels: {
            inside: true,
            shadow: false,
            style: {
              color: 'rgba(0, 0, 0, 1)',
              borderColor: 'rgba(0, 0, 0, 0)',
              backgroundColor: 'rgba(0, 0, 0, 0)'
            },
          },
          data: baseSeries[label],
          legendIndex: 1,

        };
        allSeries.push(series1);

        var series2 = {
          name: label + ' - % Completed',
          showInLegend: false,
          type: 'columnrange',
          grouping: false,
          animation: false,
          backgroundColor: 'rgba(0, 0, 0, 0)',
          inverted: true,
          spacingBottom: 0,
          spacingRight: 0,
          spacingLeft: 0,
          style: {
            fontFamily: 'inherit',
          },
          dataLabels: {
            enabled: true,
            inside: true,
            formatter: function (t, n) {
              if (t.align = 'right') {
                return this.point.percentage + '%';
              }

              return '';
            },
            style: {
              color: 'rgba(0, 0, 0, 1)',
              borderColor: 'rgba(1, 1, 1, 1)',
              backgroundColor: 'rgba(0, 0, 0, 0)'
            }
          },
          data: progressSeries[label],
        };

        allSeries.push(series2);
    }


    Highcharts.chart(element, {
      chart: {inverted: true},
      series: allSeries,
      accessibility: {
        landmarkVerbosity: 'disabled',
      },

      legend: {
        enabled: true
      },

      plotOptions: {
        columnrange: {
          borderRadius: 5
        },
        series: {
          animation: false,
          cursor: 'pointer',
          events: {},
          softThreshold: true,
          states: {
            inactive: {
              opacity: 1,
            },
          },
          opacity: 1,
          pointWidth: 18,
        },
      },

      title: {
        text: null,
      },

      credits: {
        enabled: false
      },

      tooltip: {
        animation: false,
        backgroundColor: 'var(--vis-color-tooltip-background)',
        borderRadius: 4,
        borderWidth: 0,
        followPointer: true,
        hideDelay: 0,
        outside: true,
        padding: 8,
        pointFormatter: function (n,d) {
          return ''
        },
        shadow: false,
        style: {
          color: 'white',
          fontWeight: 400,
          fontFamily: 'inherit',
        },
      },

      xAxis: {
          categories: categoricals,
          type: 'category',
        },

        yAxis: {
          type: 'datetime',
          opposite: true,
          title: {
            enabled: false
          }
         }
    });
   doneRendering();
  }
});




var numberWithCommas = function (x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

var happyData = [0, 1, 3, 2, 0, 3, 4, 5];
var sadData = [2, 1, 3, 5, 4, 0, 1, 0];
var angryData = [3, 2, 0, 2, 5, 0, 0, 0];
var mellowData = [0, 2, 3, 1, 1, 2, 1, 1];
var dates = ["Jul 1", "Jul 8", "Jul 15", "July 22", "Jul 29", "Aug 5", "Aug 12"];


var bar_ctx = document.getElementById('bar-chart');

var bar_chart = new Chart(bar_ctx, {
  type: 'bar',
  data: {
    labels: dates,
    datasets: [
      {
        label: 'Happy',
        data: happyData,
        backgroundColor: "#512DA8",
        hoverBackgroundColor: "#7E57C2",
        hoverBorderWidth: 0
      },
      {
        label: 'Sad',
        data: sadData,
        backgroundColor: "#FFA000",
        hoverBackgroundColor: "#FFCA28",
        hoverBorderWidth: 0
      },
      {
        label: 'Angry',
        data: angryData,
        backgroundColor: "#D32F2F",
        hoverBackgroundColor: "#EF5350",
        hoverBorderWidth: 0
      },
      {
        label: 'Mellow',
        data: mellowData,
        backgroundColor: "blue",
        hoverBackgroundColor: "#EF5350",
        hoverBorderWidth: 0
      },
    ]
  },
  options: {
    animation: {
      duration: 10,
    },
    tooltips: {
      mode: 'label',
      callbacks: {
        label: function (tooltipItem, data) {
          return data.datasets[tooltipItem.datasetIndex].label + ": " + numberWithCommas(tooltipItem.yLabel);
        }
      }
    },
    scales: {
      xAxes: [{
        stacked: true,
        gridLines: { display: false },
      }],
      yAxes: [{
        stacked: true,
        ticks: {
          callback: function (value) { return numberWithCommas(value); },
        },
      }],
    },
    legend: { display: true }
  },
  plugins: [{
    beforeInit: function (chart) {
      chart.data.labels.forEach(function (value, index, array) {
        var a = [];
        a.push(value.slice(0, 5));
        var i = 1;
        while (value.length > (i * 5)) {
          a.push(value.slice(i * 5, (i + 1) * 5));
          i++;
        }
        array[index] = a;
      })
    }
  }]
})



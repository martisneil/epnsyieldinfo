

$(document).ready(function(){

var user_amount=0;
var user_price=0;
var current_price=0;
var user_apr=0;
var user_duration=0;

$('body').append('<div style="" id="loadingDiv"><div class="loader">Loading...</div><h3>Fetching data from EPNS smartcontracts</h3></div>');

function removeLoader(){
    $( "#loadingDiv" ).fadeOut(1000, function() {
      // fadeOut complete. Remove the loading div
      $( "#loadingDiv" ).remove(); //makes page more lightweight
  });
}


getNodeData();

$('#inputAmount').on('keyup',function(event) {

user_amount=Number($('#inputAmount').val());
$('#return').val(`$ ${Math.floor(Number(user_amount*user_price/current_price)+((user_amount*user_apr*user_price*user_duration)/(current_price*100*52)))}`);
});

$('#inputPrice').on('keyup',function(event) {
user_price=Number($('#inputPrice').val());
console.log(`user price entered:${user_price}`);
$('#return').val(`$ ${Math.floor(Number(user_amount*user_price/current_price)+((user_amount*user_apr*user_price*user_duration)/(current_price*100*52)))}`);
});

$('#inputAPR').on('keyup',function(event) {
user_apr=Number($('#inputAPR').val());
$('#return').val(`$ ${Math.floor(Number(user_amount*user_price/current_price)+((user_amount*user_apr*user_price*user_duration)/(current_price*100*52)))}`);
});

$('#slider').on('input', function() {
  user_duration=$(this).val();
  $('#return').val(`$ ${Math.floor(Number(user_amount*user_price/current_price)+((user_amount*user_apr*user_price*user_duration)/(current_price*100*52)))}`);

});

var backEndData;
async function getNodeData(){
 await fetch('/data').then(response => response.json()).then(data =>(backEndData=data));
 const epochArrayLatest=backEndData.epochArray;
 const price=backEndData.latestPrice;
 user_price=Number(price);
 current_price=Number(price);
 const poolSize=backEndData.currentPoolSize;
 const epochID=backEndData.latestEpochID;
 const balanceDuration=100-epochID;
 const epochApr=backEndData.latestApr;
 user_apr=Number(epochApr);
 const mytimeout=setTimeout(removeLoader, 1000);

$('.currentPrice').hide().html(price).fadeIn('slow');
$('.pool').hide().html(poolSize).fadeIn('slow');
$('.epId').hide().html(epochID+'/100').fadeIn('slow');
$('.apRate').hide().html(epochApr).fadeIn('slow');
$('#inputPrice').attr("placeholder", `Current price: $${price}`).fadeIn('slow');
$('#inputAPR').attr("placeholder", `Current APR: ${epochApr}%`).fadeIn('slow');
$('#slider').attr('max',balanceDuration);
user_duration=Math.floor(($('#slider').attr('max'))/2);
$('#sliderValue').val(user_duration);


// changing chart data
var reward=30000;
for (var i = 0; i < epochArrayLatest.length; i++) {
  labels[i]=i+1;
  data.datasets[0].data[i]=(100*52*reward/epochArrayLatest[i]).toFixed(2);
  reward=reward-100;
}
  const myChart = new Chart($('#myChart'),config);

}
// fetch realtime value of slider and display
$('#slider').on('input', function() {
  $('#sliderValue').html($(this).val())
});


// tippy constuctor
tippy('#img1', {
     theme: 'light',
  content: 'Last Traded Price from CoinGecko'
});
tippy('#img2', {
     theme: 'light',
  content: 'Total no of staked EPNS coins'
});
tippy('#img3', {
     theme: 'light',
  content: 'No of weeks since commencement of Yield farming. Total duration of Yield farming:100 weeks'
});
tippy('#img4', {
     theme: 'light',
  content: 'annual percentage returns based on current rewards and no of tokens staked'
});


// chart js primitives
  var labels = [];
  var data = {
    labels: labels,
    datasets: [{
      label: 'APR',
      backgroundColor: '#423F3E',
      pointRadius: 2,
      data: [],
    }]
  };

  const config = {
    type: 'line',
    data: data,
    options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
            position: 'left',
          }
        },
        scales: {
          y: {
            grid: {
              color: '#F1F1F1',
            }
          },
          x: {
            grid: {
              color: '#F1F1F1'
            }
          }
        }
      }
  };
});

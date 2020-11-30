type Coin = {
  id: string;
  name: string;
  symbol: string;
  isSaved: boolean;
  data: {
    marketData: number[];
    image: string;
    dateIssued: Date;
  };
};

type GraphCoin = {
  x: Date;
  y: number;
};

type GraphCoins = {
  [key: string]: [GraphCoin];
};

type ChartData = {
  type: 'line';
  showInLegend: true;
  name: string;
  markerType: 'square';
  dataPoints: GraphCoin[];
};

const apiManager = new ApiManager();
const renderManager = new Renderer();
let chart: any = {};
let interval: any;


//search box function
$('.navbar').on('click', '.search-btn', function() {
     let text = $('#search').val()?.toString().toLowerCase();
const filteredCoins = apiManager.data.coins.filter(c => c.symbol===text);
text === ""? alert('Please enter coin symbol') :filteredCoins.length===0? alert('Coin is not found, Please enter full coin Symbol name in 3 letters'): null;
renderManager.renderCoinsList(filteredCoins.length===0 ? apiManager.data.coins : filteredCoins);
$('#search').val('');
$('.about-container').empty();
$('#reports-container').empty();
});

// call display coins from API to Render
const displayCoins = async () => {
  renderManager.renderCoinsLoading();
  let list: Coin[] = await apiManager.getCoinsList();
  renderManager.renderCoinsList(list);
};
// displayCoins();


//display coin-info by ID from button
const displayMoreData = async (id: string) => {
  renderManager.renderCoinDataLoading(id);
  let coin: Coin | undefined = await apiManager.getCoinInfo(id);
  coin ? renderManager.renderMoreInfo(id, coin.data) : undefined;
};

//call function to load modal for more than 5 coins selected by ID
const handelSelectedCoins = (id: any, value: any) => {
  let selectedCoins = apiManager.toggleSave(id, value);
  if (selectedCoins.favorites.length === 6) {
    renderManager.renderSelectedCoinsList(selectedCoins);
    selectedCoins.coin.isSaved = false;
  }
};

// on click "Main selected coin toggle" and send data-id from btn(actually from main div coin-card) and value from toggle to handelSelectedCoins
$('.coins-container').on(
  'click',
  '.custom-control-input',
  function (event): void {
    let id: string = $(this).closest('.card').attr('data-id')!;
    let value: boolean = event.currentTarget.checked;
    handelSelectedCoins(id, value);
  }
);

//on click "More info" send id from btn(actually from main div coin-card) to displayMoreData(id) & saveToLocalStorage(id)
$('.coins-container').on('click', '.btn', async function () {
  let id = $(this).closest('.card').attr('data-id')!;
  if ($(this).next('.more-info').css('display') === 'none') {
    renderManager.renderCoinDataLoading(id);
    let coinData: Coin['data'] = await handleMoreInfoData(id!);
    renderManager.clearLoading(id);
    id ? renderManager.renderMoreInfo(id, coinData) : undefined;
    $(this).next('.more-info').css('display', 'block');
  } else {
    $(this).next('.more-info').css('display', 'none');
  }
});

//handel the state of More Info (display and set time after first click API call)
const handleMoreInfoData = async (id: string) => {
  let coin: Coin | undefined = apiManager.data.coins.find((c) => c.id === id);
  if (coin?.data) {
    // console.log("my If data check is true")
    let coinData: Coin = coin;
    let issuedDate = coin.data.dateIssued.getTime();
    let currentDate = new Date().getTime();
    let delay = currentDate - issuedDate;
    if (delay > 12000) {
      // console.log(My if has a delay more than 2 min")
      let coinData: Coin = await apiManager.getCoinInfo(id);
      return coinData.data;
    } else {
      // console.log("My else has delay less than 2 min")
      return coinData.data;
    }
  } else {
    // console.log("My else data check don't have coin data yet")
    let coinData: Coin = await apiManager.getCoinInfo(id);
    return coinData.data;
  }
};

// on click "Modal selected coin toggle" and change Coin.isSaved value in main coin array by id
$('.coins-container').on(
  'click',
  '.modal-custom-control-input',
  function (event): void {
    let id: string = $(this).closest('.modal-card').attr('data-id')!;
    let value: boolean = event.target.checked ? true : false;
    let coin: Coin = apiManager.data.coins.find(
      (coin: Coin) => coin.id === id
    )!;
    coin.isSaved = value;
  }
);

//on click "close" modal card
$('.coins-container').on('click', '.close', function (): void {
  $('#myModal').css('display', 'none');
  let coinsData = apiManager.data.coins;
  renderManager.renderCoinsList(coinsData);
});

$('.coins-tab').on('click', function (): void {
  let coinsData = apiManager.data.coins;
  renderManager.renderCoinsList(coinsData);
  clearInterval(interval);
});

$('#about-tab').on('click', function (): void {
  renderManager.renderAboutPage();
  clearInterval(interval);
});

const updateChart = async () => {
  await apiManager.getDataToCanvas();
  chart.render();
};

$('#realTime-tab').on('click', async function (): Promise<void> {
    const SelectedCoinsArraylength= apiManager.data.coins.filter(s=>s.isSaved).length;
      if(SelectedCoinsArraylength===0){
       renderManager.renderAlertReports();
      }else{
          $('.coins-container').empty();
          $('.about-container').empty();
          $('#reports-container').empty();
          renderManager.renderRealTimeLoading();
    apiManager.data.chartOptions.data = [];
    apiManager.data.graphCoins = {};
    await apiManager.getDataToCanvas();
    chart = new CanvasJS.Chart('reports-container', apiManager.data.chartOptions);
    chart.render();
    interval = setInterval(updateChart, 2000);
  }
});

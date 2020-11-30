class ApiManager {
  data: {
    coins: Coin[];
    graphCoins: GraphCoins;
    chartOptions: {
      title: {
        text: string;
      };
      axisX: {
        title: 'Time';
        valueFormatString: 'HH:mm:ss';
      };
      axisY: {
        title: 'Coin Value in $';
        titleFontColor: string;
        lineColor: string;
        labelFontColor: string;
        tickColor: string;
      };
      legend: {
        cursor: 'pointer';
        verticalAlign: 'bottom';
        horizontalAlign: 'left';
        dockInsidePlotArea: true;
      };
      data: ChartData[];
    };
  };

  constructor() {
    this.data = {
      coins: [],
      graphCoins: {},
      chartOptions: {
        title: {
          text: '' ,
        },
        axisX: {
          title: 'Time',
          valueFormatString: 'HH:mm:ss',
        },
        axisY: {
          title: 'Coin Value in $',
          titleFontColor: '#4F81BC',
          lineColor: '#4F81BC',
          labelFontColor: '#4F81BC',
          tickColor: '#4F81BC',
        },
        legend: {
          cursor: 'pointer',
          verticalAlign: 'bottom',
          horizontalAlign: 'left',
          dockInsidePlotArea: true,
        },
        data: [],
      },
    };
  }

  //get info about all crypto-coins
  getCoinsList = async () => {
    const result = await $.ajax({
      method: 'GET',
      url: 'https://api.coingecko.com/api/v3/coins',
      dataType: 'json',
      error: (error) => error,
      success: (data: Coin[]) =>
        data.splice(100, data.length).map((coin) => (coin.isSaved = false)),
    });
    this.data.coins = result;
    return this.data.coins;
  };

  //get info about a specific coin by coin-id
  getCoinInfo = async (id: Coin['id']) => {
    let coinData = await $.ajax({
      method: 'GET',
      url: `https://api.coingecko.com/api/v3/coins/${id}`,
      dataType: 'json',
      error: (text, error) => ({ error: text }),
      success: (data) => data,
    });
    let coin: Coin = this.data.coins.find((coin) => coin.id === id)!;
    coin
      ? (coin.data = {
          marketData: [
            coinData.market_data.current_price.usd,
            coinData.market_data.current_price.ils,
            coinData.market_data.current_price.eur,
          ],
          image: coinData.image.small,
          dateIssued: new Date(),
        })
      : undefined;
    return coin;
  };

  //count number of toggles (selected coins) and change value of isSaved based on number of toggles
  toggleSave(id: Coin['id'], value: boolean) {
    let favoritesCount: number = this.data.coins.filter((c) => c.isSaved).length;
    let coin: Coin = this.data.coins.find((coin) => coin.id === id)!;
    if (value && favoritesCount <= 5) {
      coin ? (coin.isSaved = value) : undefined;
    } else if (!value) {
      coin ? (coin.isSaved = value) : undefined;
    }
    let favorites = this.data.coins.filter((c) => c.isSaved);
    return { favorites, coin };
  }

  // Get data based on selected coins
  getDataToCanvas = async () => {
    let favoritesSymbol = this.data.coins.filter((c) => c.isSaved).map((f) => f.symbol);
    let favoritesName = this.data.coins.filter((c) => c.isSaved).map((f) =>' ' + f.name );
    this.data.chartOptions.title.text= `${favoritesName} to USD`;
    let graphAjaxData = await $.ajax({
      method: 'GET',
      url: `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${favoritesSymbol}&tsyms=USD`,
      dataType: 'json',
      error: (text, error) => ({ error: text }),
      success: (graphCoins: {}) => graphCoins,
    });

    Object.entries(graphAjaxData).map((coin: [string, { USD: number }]) => {
      // to turn to array of objects and map it.
      //  {{name:{USD:num}},{name:{USD:num},{}} entries =>
      //  [[name,{USD:num}], [], []]
      let coinData = { x: new Date(), y: coin[1].USD }; // new object with coin data
      let coinName = coin[0]; //getting the coin name
      this.data.graphCoins[coinName] //check if the coin is saved in graphCoins object.
        ? this.data.graphCoins[coinName].push(coinData) //ify
        : (this.data.graphCoins[coinName] = [coinData]);
    });
    this.data.chartOptions.data = Object.entries(this.data.graphCoins).map(
      (coin: [string, GraphCoin[]]) => {
        let name = coin[0];
        let coinData = coin[1];
        return {
          type: 'line',
          showInLegend: true,
          name,
          markerType: 'square',
          dataPoints: coinData,
        };
      }
    );
    return 'success';
  };

}
//End

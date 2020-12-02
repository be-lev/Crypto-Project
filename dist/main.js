"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const apiManager = new ApiManager();
const renderManager = new Renderer();
let chart = {};
let interval;
//search box function
$('.navbar').on('click', '.search-btn', function () {
    var _a;
    let text = (_a = $('#search').val()) === null || _a === void 0 ? void 0 : _a.toString().toLowerCase();
    const filteredCoins = apiManager.data.coins.filter(c => c.symbol === text);
    text === "" ? alert('Please enter coin symbol') : filteredCoins.length === 0 ? alert('Coin is not found, Please enter full coin Symbol name in 3 letters') : null;
    renderManager.renderCoinsList(filteredCoins.length === 0 ? apiManager.data.coins : filteredCoins);
    $('#search').val('');
    $('.about-container').empty();
    $('#reports-container').empty();
});
// call display coins from API to Render
const displayCoins = () => __awaiter(void 0, void 0, void 0, function* () {
    renderManager.renderCoinsLoading();
    let list = yield apiManager.getCoinsList();
    renderManager.renderCoinsList(list);
});
// displayCoins();
//display coin-info by ID from button
const displayMoreData = (id) => __awaiter(void 0, void 0, void 0, function* () {
    renderManager.renderCoinDataLoading(id);
    let coin = yield apiManager.getCoinInfo(id);
    coin ? renderManager.renderMoreInfo(id, coin.data) : undefined;
});
//call function to load modal for more than 5 coins selected by ID
const handelSelectedCoins = (id, value) => {
    let selectedCoins = apiManager.toggleSave(id, value);
    if (selectedCoins.favorites.length === 6) {
        renderManager.renderSelectedCoinsList(selectedCoins);
        selectedCoins.coin.isSaved = false;
    }
};
// on click "Main selected coin toggle" and send data-id from btn(actually from main div coin-card) and value from toggle to handelSelectedCoins
$('.coins-container').on('click', '.custom-control-input', function (event) {
    let id = $(this).closest('.card').attr('data-id');
    let value = event.currentTarget.checked;
    handelSelectedCoins(id, value);
});
//on click "More info" send id from btn(actually from main div coin-card) to displayMoreData(id) & saveToLocalStorage(id)
$('.coins-container').on('click', '.btn', function () {
    return __awaiter(this, void 0, void 0, function* () {
        let id = $(this).closest('.card').attr('data-id');
        if ($(this).next('.more-info').css('display') === 'none') {
            renderManager.renderCoinDataLoading(id);
            let coinData = yield handleMoreInfoData(id);
            renderManager.clearLoading(id);
            id ? renderManager.renderMoreInfo(id, coinData) : undefined;
            $(this).next('.more-info').css('display', 'block');
        }
        else {
            $(this).next('.more-info').css('display', 'none');
        }
    });
});
//handel the state of More Info (display and set time after first click API call)
const handleMoreInfoData = (id) => __awaiter(void 0, void 0, void 0, function* () {
    let coin = apiManager.data.coins.find((c) => c.id === id);
    if (coin === null || coin === void 0 ? void 0 : coin.data) {
        // console.log("my If data check is true")
        let coinData = coin;
        let issuedDate = coin.data.dateIssued.getTime();
        let currentDate = new Date().getTime();
        let delay = currentDate - issuedDate;
        if (delay > 12000) {
            // console.log(My if has a delay more than 2 min")
            let coinData = yield apiManager.getCoinInfo(id);
            return coinData.data;
        }
        else {
            // console.log("My else has delay less than 2 min")
            return coinData.data;
        }
    }
    else {
        // console.log("My else data check don't have coin data yet")
        let coinData = yield apiManager.getCoinInfo(id);
        return coinData.data;
    }
});
// on click "Modal selected coin toggle" and change Coin.isSaved value in main coin array by id
$('.coins-container').on('click', '.modal-custom-control-input', function (event) {
    let id = $(this).closest('.modal-card').attr('data-id');
    let value = event.target.checked ? true : false;
    let coin = apiManager.data.coins.find((coin) => coin.id === id);
    coin.isSaved = value;
});
//on click "close" modal card
$('.coins-container').on('click', '.close', function () {
    $('#myModal').css('display', 'none');
    let coinsData = apiManager.data.coins;
    renderManager.renderCoinsList(coinsData);
});
$('.coins-tab').on('click', function () {
    let coinsData = apiManager.data.coins;
    renderManager.renderCoinsList(coinsData);
    clearInterval(interval);
});
$('#about-tab').on('click', function () {
    renderManager.renderAboutPage();
    clearInterval(interval);
});
const updateChart = () => __awaiter(void 0, void 0, void 0, function* () {
    yield apiManager.getDataToCanvas();
    chart.render();
});
$('#realTime-tab').on('click', function () {
    return __awaiter(this, void 0, void 0, function* () {
        const SelectedCoinsArraylength = apiManager.data.coins.filter(s => s.isSaved).length;
        if (SelectedCoinsArraylength === 0) {
            renderManager.renderAlertReports();
        }
        else {
            $('.coins-container').empty();
            $('.about-container').empty();
            $('#reports-container').empty();
            renderManager.renderRealTimeLoading();
            apiManager.data.chartOptions.data = [];
            apiManager.data.graphCoins = {};
            yield apiManager.getDataToCanvas();
            chart = new CanvasJS.Chart('reports-container', apiManager.data.chartOptions);
            chart.render();
            interval = setInterval(updateChart, 2000);
        }
    });
});

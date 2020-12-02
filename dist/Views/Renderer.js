"use strict";
class Renderer {
    //insert coin info into card from coin API data-Coin
    renderCoinCard(coinData) {
        let checked = coinData.isSaved ? 'checked' : null;
        $('.coins-container').append(`
    <div data-id="${coinData.id}" id="${coinData.id}" class="card m-4" style="width: 18rem;">
        <div class="card-body main-card">
            <div class="bg"></div>
            <h5 class="card-title">${coinData.symbol.toUpperCase()}</h5>
            <p class="card-text">${coinData.name}</p>
            <a   href="#<?php echo("a".$cntr); ? class="btn-moreInfo btn btn-primary"><?php echo($cntr); ?>More Info</a>
            <p  class="card-text more-info"></p>
            <div class="custom-control custom-switch">
                <input type="checkbox" class="custom-control-input " id="customSwitch${coinData.id}" ${checked}>
                <label class="custom-control-label" for="customSwitch${coinData.id}">Select Coin</label>
            </div>
            
        </div>
    </div>
    `);
    }
    //render coins into cards
    renderCoinsList(CoinsList) {
        $('.coins-container').empty();
        $('.about-container').empty();
        $('#reports-container').empty();
        for (const coinData of CoinsList) {
            this.renderCoinCard(coinData);
        }
    }
    //loading while waiting for Coins list API to respond
    renderCoinsLoading() {
        $('.coins-container').empty();
        $('.coins-container').append(`
            <div class="spinner-border text-warning" style="width: 5rem; height:5rem;" role="status">
                <span class="sr-only">Loading...</span>
            </div>
        `);
    }
    //loading while waiting for Coins list API to respond
    renderRealTimeLoading() {
        $('#reports-container').empty();
        $('#reports-container').append(`
            <div class="spinner-border text-warning" style="width: 5rem; height:5rem;" role="status">
                <span class="sr-only">Loading...</span>
            </div>
        `);
    }
    //loading while waiting for Coin more info API to respond
    renderCoinDataLoading(id) {
        const infoButton = $(`#${id}`).find('.btn-moreInfo');
        infoButton.empty();
        infoButton.append(`
        <span class="spinner-border spinner-border-sm"></span>
        Loading..
        `);
    }
    //clear waiting loading more info card
    clearLoading(id) {
        const infoContainer = $(`#${id}`).find('.more-info');
        infoContainer.empty();
        const infoButton = $(`#${id}`).find('.btn-moreInfo');
        infoButton.empty();
        infoButton.append(`
        <a  href="#" class="btn-moreInfo btn btn-primary">More Info</a>
        `);
    }
    // render more info into collapse card
    renderMoreInfo(id, coin) {
        const infoContainer = $(`#${id}`).find('.more-info');
        infoContainer.empty().append(`
            <div>
                <center><img class="coin-img"src=${coin.image}  alt="icon"></center>  
            <table id="coin-table">
                <tr>
                    <th>Dollar</th>
                    <th>Shekel</th> 
                    <th>Euro</th>
                </tr>
                <tr>
                    <td> $ ${coin.marketData[0]} &nbsp</td>
                    <td> &#8362 ${coin.marketData[1]} &nbsp</td>
                    <td> &#8364 ${coin.marketData[2]} &nbsp</td>
                </tr>
            </table>
            </div>
        `);
    }
    //render popup-modal for selected coins and  call render selected coins and last coin
    renderSelectedCoinsList(selectedList) {
        $('.modal-content').empty();
        $('.coins-container').append(`
        <div id="myModal" class="modal">
                <div class="modal-header">
                    <h2>You are trying to enter "Real-Time reports" with 6 coins </h2>
                    <p class='modal-message'>The maximum amount of coins to print a report is 5, you have selected </p>
                    <div class="modal-buttons">
                    <button class="close">Close</button>
                    </div>
                </div>   
            <div class="modal-content"> </div> 
           
        </div>
    `);
        selectedList.favorites.map((coin) => {
            selectedList.coin.id === coin.id
                ? this.renderLastAdded(coin)
                : this.renderSelectedCoinsCard(coin);
        });
    }
    // Render the last coin
    renderLastAdded(coin) {
        $('.modal-message').append(`<span> <strong>"${coin.name}"</strong> How would you like to continue?</span>`);
    }
    // Render selected coins from main-coins-page into selected pop-up modal
    renderSelectedCoinsCard(selectedCoinData) {
        $('.modal-content').append(`
            <div class="modal-card" data-id="${selectedCoinData.id}">
                <div class="modal-card-body">
                    <h5 class="modal-card-title">${selectedCoinData.symbol.toUpperCase()}</h5>
                    <p class="modal-card-text">${selectedCoinData.name}</p>
                    <div class="modal-custom-control modal-custom-switch">
                        <input type="checkbox" class="modal-custom-control-input " id="customSwitch2${selectedCoinData.id}" checked>
                        <label class="modal-custom-control-label" for="customSwitch2${selectedCoinData.id}">Select Coin</label>
                    </div>
                </div>
            </div>
        `);
        this.displayTooMuchCoins();
    }
    //Display Selected coin modal
    displayTooMuchCoins() {
        $('#myModal').css('display', 'block');
    }
    //Render about page
    renderAboutPage() {
        $('.coins-container').empty();
        $('.about-container').empty();
        $('#reports-container').empty();
        $('.about-container').append(`
        <div class="appDescription-container">
        <div class="selfi-container">
        <img src="../assets/images/selfi.jpg"  width="300" height="400" class="d-inline-block align-top" alt="">
    </div>
            <p>My name is Lev Berger I'm the developer of this single page crypto coin App 
            <br>
            This App is build using TypeScript, JavaScript, jQuery, Bootstrap, CSS and HTML 
            </p>
        </div>
 `);
    }
    renderAlertReports() {
        $('.coins-container').append(`
        <div class="modal1">
            <h1>You must select one or more coins to enter Real-Time reports</h1>
            <div class="modal-buttons">
                <button class="close">Close</button>
            </div>
        </div>   
    `);
    }
} //End

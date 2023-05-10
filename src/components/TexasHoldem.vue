<template>
    <div class="stage"></div>
</template>

<script>
import * as PIXI from "pixi.js";
// import anime from "animejs";
import {Graphics} from "@pixi/graphics";

function getCardType(index) {
    return Math.floor(index / 13);
}
function getCardNumber(index) {
    return index % 13;
}

const actionDefault = -1;
const actionFall = 0;
const actionCall = 1;
const actionRaise = 2;

class Player {
    position;
    totalPlayers;
    point;
    bigBlind;
    smallBlind;
    isEnd;
    cardsType;
    cardsNumber;
    lastAction;

    constructor() {
        this.position = 0;
        this.totalPlayers = 0;
        this.point = 10000;
        this.bigBlind = 100;
        this.smallBlind = 50;
        this.isEnd = false;
        this.cardsType = Array();
        this.cardsNumber = Array();
        this.lastAction = actionDefault;
    }

    initCards() {
        this.isEnd = false;
        while (this.cardsType.length > 0) {
            this.cardsType.pop();
            this.cardsNumber.pop();
        }
    }

    call(cash) {
        this.point -= cash;
        this.lastAction = actionCall;
        return cash;
    }

    raise(cash) {
        this.point -= cash;
        this.lastAction = actionRaise;
        return cash;
    }

    fall() {
        this.lastAction = actionFall;
        this.end();
    }

    end() {
        this.isEnd = true;
    }

    addCard(cardIndex) {
        this.cardsType.push(getCardType(cardIndex));
        this.cardsNumber.push(getCardNumber(cardIndex));
    }

    addPlayer() {
        this.totalPlayers++;
    }

    isBigBlind() {
        return this.position === this.totalPlayers - 1;
    }

    isSmallBlind() {
        return this.position === this.totalPlayers - 2;
    }
}

// import app from "@/App.vue";
export default {
    name: "TexasHoldem",
    props: {
        playerName: String
    },
    data: function () {
        return {
            game: null,
            publicPath: process.env.BASE_URL,
            colors: ["75F4F4", "90E0F3", "B8B3E9", "D999B9"],
        };
    },
    mounted() {
        this.game = new PIXI.Application({
            transparent: true,
            antialias: true
        });
        this.$el.appendChild(this.game.view);
        this.game.renderer.view.style.display = "block";
        this.game.renderer.autoResize = true;
        this.game.renderer.resize(window.innerWidth, window.innerHeight);
        let tableWidth = getTableWidth();
        let tableHeight = getTableHeight();
        let tableX = tableWidth / 8.0;
        let tableY = (window.innerHeight - tableHeight) / 2.0 * 0.6;
        let game = this.game;
        let cardPlaceWidth = (tableWidth - tableHeight) / 5.0;
        let cardPlaceHeight = fromW2H(cardPlaceWidth);
        let cardPlaceX = (tableWidth - tableHeight) / 2
        let cardPlaceY = (tableHeight - cardPlaceHeight) / 2
        let cardWidth = cardPlaceWidth - 4.0;
        let cardHeight = fromW2H(cardWidth);
        let totalCards = [];
        let cardsNumber = 52;
        let currentCardIndex = 0;
        let playerNumber = 0;
        let players = [];

        addTable();
        addCardCenter();
        addCards();
        startGame();
        deliverHoleCards();
        flopCards();
        turnCard();
        riverCard();

        // start game
        function startGame() {
            totalCards = shuffle(Array.from(Array(cardsNumber).keys()));
            for (let i = 0; i < playerNumber; i++) {
                players.push(new Player());
            }
        }

        function deliverHoleCards() {
            // 2 hands
            newCard(true, tableWidth / 2 - cardWidth, tableHeight - cardHeight - 1);
            newCard(true, tableWidth / 2, tableHeight - cardHeight - 1);
            if (playerNumber > 1) {
                for (let i = 0; i < playerNumber - 1; i++) {
                    newCard(false, 0, 0)
                }
            }
        }

        function flopCards() {
            for (let i = 0; i < 3; i++) {
                communityCards(i);
            }
        }

        function turnCard() {
            communityCards(3);
        }

        function riverCard() {
            communityCards(4);
        }

        function communityCards(index) {
            let relativeX = (cardPlaceWidth - cardWidth) / 2;
            let relativeY = (cardPlaceHeight - cardHeight) / 2;
            const x = cardPlaceX + index * cardPlaceWidth + relativeX;
            const y = cardPlaceY + relativeY;
            newCard(true, x, y);
        }

        // Draw a table on canvas
        function addTable() {
            let roundBox = new Graphics();
            roundBox.lineStyle(10, 0xC4870E, 1);
            roundBox.beginFill(0x457DA3);
            roundBox.drawRoundedRect(0, 0, tableWidth, tableHeight, tableHeight / 2);
            roundBox.endFill();
            // make table placed center
            roundBox.x = tableX;
            roundBox.y = tableY;
            game.stage.addChild(roundBox);
        }

        function addCardCenter() {
            let lineWidth = 4;
            let lineColor = 0xFEEB77;
            let backColor = 0xAA4F08;
            let cardPlace = new PIXI.Graphics();
            cardPlace.lineStyle(lineWidth, lineColor, 1);
            cardPlace.beginFill(backColor);
            for (let i = 0; i < 5; i++) {
                console.log(i);
                let x = x2g(i * cardPlaceWidth + cardPlaceX);
                let y = y2g(cardPlaceY);
                console.log(x, y, cardPlaceWidth, cardPlaceHeight);
                cardPlace.drawRect(x, y, cardPlaceWidth, cardPlaceHeight);
            }
            cardPlace.endFill();
            game.stage.addChild(cardPlace);
        }

        function addCards() {
            let startX = x2g((tableWidth - tableHeight) / 2 - 20 - cardWidth);
            let startY = y2g((tableHeight - cardPlaceHeight) / 2);
            for (let i = 0; i < 4; i++) {
                // Magically load the png asynchronously
                let sprite = PIXI.Sprite.from('./assets/poker/0_0.png');
                sprite.width = cardWidth;
                sprite.height = cardHeight;
                sprite.x = startX + i * 2;
                sprite.y = startY + i * 2;
                game.stage.addChild(sprite);
            }
        }

        function getTableWidth() {
            return window.innerWidth * 0.8;
        }

        function getTableHeight() {
            return getTableWidth() * 0.5;
        }

        function x2g(x) {
            return x + tableX;
        }

        function y2g(y) {
            return y + tableY;
        }

        function fromW2H(width) {
            return width / 23.0 * 31.0;
        }

        function number2card(index) {
            let cardType = getCardType(index) + 1;
            let cardNumber = getCardNumber(index) + 2;
            return './assets/poker/' + cardType + '_' + cardNumber + '.png'
        }

        function shuffle(cards) {
            for (let i = cards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const temp = cards[i];
                cards[i] = cards[j];
                cards[j] = temp;
            }
            return cards;
        }

        function newCard(visible, x, y, player = null) {
            console.log(currentCardIndex);
            if (player != null) {
                player.addCard(currentCardIndex);
            }
            let card = PIXI.Sprite.from((visible === true) ?
                number2card(totalCards[currentCardIndex]) : './assets/poker/0_0.png');
            currentCardIndex++;
            card.width = cardWidth;
            card.height = cardHeight;
            card.x = x2g(x);
            card.y = y2g(y);
            game.stage.addChild(card);
            return card;
        }
    },
    methods: {

    }
}
</script>

<style scoped>

</style>
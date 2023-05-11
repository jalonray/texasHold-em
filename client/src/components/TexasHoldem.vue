<script setup lang="ts">
import * as PIXI from "pixi.js";
// import anime from "animejs";
import {Graphics} from "@pixi/graphics";
import {TexasDef} from '../../../declare/TypeDescription';
// import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';

// const cardNumber = TexasDef.cardNumber;
// const cardType = TexasDef.cardType;
// const stageFlop = TexasDef.stageFlop;
// const stageTurn = TexasDef.stageTurn;
// const stageRiver = TexasDef.stageRiver;
// const stageEnd = TexasDef.stageEnd;
const invisibleCard = TexasDef.invisibleCard;
// const initialPoint = TexasDef.initialPoint;
// const stagePreFlop = TexasDef.stagePreFlop;
// const cardsNumber = TexasDef.cardsNumber;
// const Game = TexasDef.Game;
// const drawCard = TexasDef.drawCard;
// const typeDefs = TexasDef.typeDefs;

function getCardType(index) {
    return Math.floor(index / 13);
}
function getCardNumber(index) {
    return index % 13;
}

// const client = new ApolloClient({
//     uri: 'http://localhost:4000/',
//     cache: new InMemoryCache(),
// });
//
// const queryGame = gql`
// query Query($gameId: Int) {
//   game(id: $gameId) {
//     flopCards {
//       id
//       index
//       number
//       type
//     }
//     turnCard {
//       id
//       index
//       number
//       type
//     }
//     riverCard {
//       id
//       index
//       number
//       type
//     }
//     players {
//       id
//       position
//       number
//       point
//       name
//       isButton
//       isBigBlind
//       isSmallBlind
//       smallBlind
//       bigBlind
//       hole1 {
//         id
//         index
//         number
//         type
//       }
//       hole2 {
//         id
//         index
//         number
//         type
//       }
//       cash
//       isEnd
//     }
//     cashPool
//     maxCash
//     currentPlayerId
//     winPlayers
//   }
// }
// `;
// const addPlayer = gql`
// mutation AddPlayer($name: String) {
//   addPlayer(name: $name) {
//     flopCards {
//       id
//       index
//       number
//       type
//     }
//     turnCard {
//       id
//       index
//       number
//       type
//     }
//     riverCard {
//       id
//       index
//       number
//       type
//     }
//     players {
//       id
//       position
//       number
//       point
//       name
//       isButton
//       isBigBlind
//       isSmallBlind
//       smallBlind
//       bigBlind
//       hole1 {
//         id
//         index
//         number
//         type
//       }
//       hole2 {
//         id
//         index
//         number
//         type
//       }
//       cash
//       isEnd
//     }
//     cashPool
//     maxCash
//     currentPlayerId
//     winPlayers
//   }
// }
// `;
// const leavePlayer = gql`
// mutation LeavePlayer($leavePlayerId: Int) {
//   leavePlayer(id: $leavePlayerId) {
//     flopCards {
//       id
//       index
//       number
//       type
//     }
//     turnCard {
//       id
//       index
//       number
//       type
//     }
//     riverCard {
//       id
//       index
//       number
//       type
//     }
//     players {
//       id
//       position
//       number
//       point
//       name
//       isButton
//       isBigBlind
//       isSmallBlind
//       smallBlind
//       bigBlind
//       hole1 {
//         id
//         index
//         number
//         type
//       }
//       hole2 {
//         id
//         index
//         number
//         type
//       }
//       cash
//       isEnd
//     }
//     cashPool
//     maxCash
//     currentPlayerId
//     winPlayers
//   }
// }
// `;
// const nextStep = gql`
// mutation NextStep($nextStepId: Int) {
//   nextStep(id: $nextStepId) {
//     flopCards {
//       id
//       index
//       number
//       type
//     }
//     turnCard {
//       id
//       index
//       number
//       type
//     }
//     riverCard {
//       id
//       index
//       number
//       type
//     }
//     players {
//       id
//       position
//       number
//       point
//       name
//       isButton
//       isBigBlind
//       isSmallBlind
//       smallBlind
//       bigBlind
//       hole1 {
//         id
//         index
//         number
//         type
//       }
//       hole2 {
//         id
//         index
//         number
//         type
//       }
//       cash
//       isEnd
//     }
//     cashPool
//     maxCash
//     currentPlayerId
//     winPlayers
//   }
// }
// `;
// const playerAction = gql`
// mutation PlayerAction($playerActionId: Int, $action: Int, $raise: Int) {
//   playerAction(id: $playerActionId, action: $action, raise: $raise) {
//     flopCards {
//       id
//       index
//       number
//       type
//     }
//     turnCard {
//       id
//       index
//       number
//       type
//     }
//     riverCard {
//       id
//       index
//       number
//       type
//     }
//     players {
//       id
//       position
//       number
//       point
//       name
//       isButton
//       isBigBlind
//       isSmallBlind
//       smallBlind
//       bigBlind
//       hole1 {
//         id
//         index
//         number
//         type
//       }
//       hole2 {
//         id
//         index
//         number
//         type
//       }
//       cash
//       isEnd
//
//     }
//     cashPool
//     maxCash
//     currentPlayerId
//     winPlayers
//   }
// }
// `;

// import app from "@/App.vue";
export default {
    name: "TexasHoldem",
    props: {
        playerName: String,
    },
    data: function () {
        return {
            gameBoard: null,
            publicPath: process.env.BASE_URL,
            colors: ["75F4F4", "90E0F3", "B8B3E9", "D999B9"],
        };
    },
    mounted() {
        this.gameBoard = new PIXI.Application({
            transparent: true,
            antialias: true
        });
        this.$el.appendChild(this.gameBoard.view);
        this.gameBoard.renderer.view.style.display = "block";
        this.gameBoard.renderer.autoResize = true;
        this.gameBoard.renderer.resize(window.innerWidth, window.innerHeight);
        let tableWidth = getTableWidth();
        let tableHeight = getTableHeight();
        let tableX = tableWidth / 8.0;
        let tableY = (window.innerHeight - tableHeight) / 2.0 * 0.6;
        let game = this.gameBoard;
        let cardPlaceWidth = (tableWidth - tableHeight) / 5.0;
        let cardPlaceHeight = fromW2H(cardPlaceWidth);
        let cardPlaceX = (tableWidth - tableHeight) / 2
        let cardPlaceY = (tableHeight - cardPlaceHeight) / 2
        let cardWidth = cardPlaceWidth - 4.0;
        let cardHeight = fromW2H(cardWidth);

        addTable();
        addCardCenter();
        addCards();
        // waitingGame();
        // startListener();

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
                let card = invisibleCard;
                let x = startX + i * 2;
                let y = startY + i * 2;
                drawCard(x, y, card);
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
            if (index === -1) {
                return './assets/poker/0_0.png';
            }
            let cardType = getCardType(index) + 1;
            let cardNumber = getCardNumber(index) + 2;
            return './assets/poker/' + cardType + '_' + cardNumber + '.png'
        }

        function drawCard(x, y, card2Draw) {
            let card = PIXI.Sprite.from(card2Draw != null ?
                number2card(card2Draw.index) : './assets/poker/0_0.png');
            card.width = cardWidth;
            card.height = cardHeight;
            card.x = x2g(x);
            card.y = y2g(y);
            game.stage.addChild(card);
            return card;
        }
    },
    methods: {
        // updateTable() {
        //     client
        //         .query({
        //             query: queryGame
        //         })
        //         .then((result) => console.log(result));
        // }
    }
}
</script>

<style scoped>

</style>

<template>
    <div class="stage"></div>
</template>
export module TexasDef {

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
    export const typeDefs = `#graphql
    # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

    type Card {
        id: Int
        index: Int
        number: String
        type: String
    }

    type Player {
        id: Int
        position: Int
        number: Int
        point: Int
        name: String
        isButton: Boolean
        isBigBlind: Boolean
        isSmallBlind: Boolean
        smallBlind: Int
        bigBlind: Int
        hole1: Card
        hole2: Card
        cash: Int
        isEnd: Boolean
    }

    type Game {
        flopCards: [Card]
        turnCard: Card
        riverCard: Card
        players: [Player]
        cashPool: Int
        maxCash: Int
        currentPlayerId: Int
        winPlayers: [Int]
    }

    # The "Query" type is special: it lists all of the available queries that
    # clients can execute, along with the return type for each. In this
    # case, the "books" query returns an array of zero or more Books (defined above).
    type Query {
        game(id: Int): Game
    }

    type Mutation {
        addPlayer(name: String): Game
        playerAction(id: Int, action: Int, raise: Int): Game
        nextStep(id: Int): Game
        leavePlayer(id: Int): Game
    }
    `;


    export enum PlayerAction {
        CALL,
        RAISE,
        FOLD,
        ALL_IN
    }

    export class Player {
        id: number
        position: number
        number: number
        point: number
        cash: number
        name: string
        isButton: Boolean
        isBigBlind: Boolean
        isSmallBlind: Boolean
        smallBlind: number
        bigBlind: number
        hole1: Card
        hole2: Card
        isEnd: Boolean
        rank: number;
        inGame: Boolean;


        constructor() {
            this.id = -1;
            this.position = -1;
            this.number = -1;
            this.point = -1;
            this.name = "";
            this.isButton = false;
            this.isBigBlind = false;
            this.isSmallBlind = false;
            this.smallBlind = 50;
            this.bigBlind = 100;
            this.isEnd = false;
            this.cash = 0;
            this.rank = 100;
            this.inGame = false;
        }

        win(winCash) {
            this.point += winCash;
        }

        pay(addCash: number) {
            this.point -= addCash;
            this.cash += addCash;
            cashPool += addCash;
            if (this.cash > maxCash) {
                maxCash = this.cash;
            }
        }

        doAction(action: PlayerAction, raise: number) {
            switch (action) {
                case PlayerAction.CALL: {
                    if (this.cash < maxCash) {
                        let addCash = maxCash - this.cash;
                        this.pay(addCash);
                    }
                    break;
                }
                case PlayerAction.RAISE: {
                    if (raise < maxCash) {
                        raise = maxCash;
                    }
                    if (raise > this.point) {
                        raise = this.point;
                    }
                    this.pay(raise);
                    break;
                }
                case PlayerAction.FOLD: {
                    this.isEnd = true;
                    this.cash = 0;
                    break;
                }
                case PlayerAction.ALL_IN: {
                    let addCash = this.point;
                    this.pay(addCash);
                    break;
                }
            }
            return this;
        }

        preFlop(newPosition: number) {
            this.hole1 = drawCard();
            this.hole2 = drawCard();
            if (this.point <= 0) {
                this.point = initialPoint;
            }
            this.position = newPosition;
            this.isButton = this.position === 0;
            this.isSmallBlind = this.position === playerNumber - 2;
            this.isBigBlind = this.position === playerNumber - 1;
            if (this.isSmallBlind) {
                this.pay(this.smallBlind);
            }
            if (this.isBigBlind) {
                this.pay(this.bigBlind);
            }
            this.inGame = true;
            this.rank = 100;
        }

        copy() {
            let player = new Player();
            player.id = this.id;
            player.position = this.position;
            player.number = this.number;
            player.point = this.point;
            player.name = this.name;
            player.isButton = this.isButton;
            player.isBigBlind = this.isBigBlind;
            player.isSmallBlind = this.isSmallBlind;
            player.smallBlind = this.smallBlind;
            player.bigBlind = this.bigBlind;
            player.hole1 = this.hole1;
            player.hole2 = this.hole2;
            player.cash = this.cash;
            player.isEnd = this.isEnd;
            player.rank = this.rank;
            player.inGame = this.inGame;
            return player;
        }

    }

    export class Card {
        id: number
        index: number
        number: string
        type: string

        constructor(cardIndex) {
            if (cardIndex === -1) {
                this.id = -1;
                this.index = -1;
                this.number = '';
                this.type = '';
                return;
            }
            this.id = cardIndex;
            this.index = cardIndex;
            this.number = getCardNumber(cardIndex);
            this.type = getCardType(cardIndex);
        }

        getDesc() {
            return this.number.concat(this.type);
        }
    }

    export class Game {
        flopCards: Array<Card>
        turnCard: Card
        riverCard: Card
        players: Array<Player>
        cashPool: number
        maxCash: number
        currentPlayerId: number
        winPlayers: Array<number>

        constructor() {
            this.flopCards = null;
            this.turnCard = null;
            this.riverCard = null;
            this.players = null;
            this.cashPool = 0;
            this.maxCash = 0;
            this.currentPlayerId = -1;
            this.winPlayers = null;
        }

        update(id) {
            this.flopCards = flop;
            this.turnCard = turn;
            this.riverCard = river;
            this.cashPool = cashPool;
            this.maxCash = maxCash;
            this.players = allPlayers();
            this.players.forEach((value) => {
                if (value.id != id) {
                    if (this.winPlayers === null || !this.winPlayers.includes(value.id, 0)) {
                        value.hole1 = invisibleCard;
                        value.hole2 = invisibleCard;
                    }
                }
            })
            console.log(players)
            this.currentPlayerId = currentPlayerId;
            return this;
        }
    }

    export const cardNumber = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A']
    export const cardType = ['d', 'c', 'h', 's']
    export const stageFlop = 1;
    export const stageTurn = 2;
    export const stageRiver = 3;
    export const stageEnd = 4;
    export const invisibleCard: Card = new Card(-1)
    export const initialPoint = 10000;
    export const stagePreFlop = 0;
    export const cardsNumber = 52;

    export let currentStage = stageEnd;
    export let flop: Array<Card> = Array(3);
    export let turn: Card;
    export let river: Card;
    export let totalCards: Array<number>;
    export let playerNumber = 0;
    export let currentCardIndex = 0;
    export let currentPlayerId: number = -1;
    export let cashPool = 0;
    export let maxCash = 0;
    export let players: Array<Player> = Array();


    export function getCardType(index) {
        return cardType[Math.floor(index / 13)];
    }

    export function getCardNumber(index) {
        return cardNumber[index % 13];
    }

    export function allPlayers() {
        let newPlayers = Array<Player>();
        players.forEach((value) => {
            let user = value.copy();
            newPlayers.push(user);
        });
        return newPlayers;
    }

    export function drawCard() {
        let card = new Card(totalCards[currentCardIndex]);
        currentCardIndex++;
        return card;
    }
}
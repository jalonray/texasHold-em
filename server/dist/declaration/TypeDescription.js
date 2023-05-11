export var TexasDef;
(function (TexasDef) {
    // A schema is a collection of type definitions (hence "typeDefs")
    // that together define the "shape" of queries that are executed against
    // your data.
    TexasDef.typeDefs = `#graphql
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
    let PlayerAction;
    (function (PlayerAction) {
        PlayerAction[PlayerAction["CALL"] = 0] = "CALL";
        PlayerAction[PlayerAction["RAISE"] = 1] = "RAISE";
        PlayerAction[PlayerAction["FOLD"] = 2] = "FOLD";
        PlayerAction[PlayerAction["ALL_IN"] = 3] = "ALL_IN";
    })(PlayerAction = TexasDef.PlayerAction || (TexasDef.PlayerAction = {}));
    class Player {
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
        pay(addCash) {
            this.point -= addCash;
            this.cash += addCash;
            TexasDef.cashPool += addCash;
            if (this.cash > TexasDef.maxCash) {
                TexasDef.maxCash = this.cash;
            }
        }
        doAction(action, raise) {
            switch (action) {
                case PlayerAction.CALL: {
                    if (this.cash < TexasDef.maxCash) {
                        let addCash = TexasDef.maxCash - this.cash;
                        this.pay(addCash);
                    }
                    break;
                }
                case PlayerAction.RAISE: {
                    if (raise < TexasDef.maxCash) {
                        raise = TexasDef.maxCash;
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
        preFlop(newPosition) {
            this.hole1 = drawCard();
            this.hole2 = drawCard();
            if (this.point <= 0) {
                this.point = TexasDef.initialPoint;
            }
            this.position = newPosition;
            this.isButton = this.position === 0;
            this.isSmallBlind = this.position === TexasDef.playerNumber - 2;
            this.isBigBlind = this.position === TexasDef.playerNumber - 1;
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
    TexasDef.Player = Player;
    class Card {
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
    TexasDef.Card = Card;
    class Game {
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
            this.flopCards = TexasDef.flop;
            this.turnCard = TexasDef.turn;
            this.riverCard = TexasDef.river;
            this.cashPool = TexasDef.cashPool;
            this.maxCash = TexasDef.maxCash;
            this.players = allPlayers();
            this.players.forEach((value) => {
                if (value.id != id) {
                    if (this.winPlayers === null || !this.winPlayers.includes(value.id, 0)) {
                        value.hole1 = TexasDef.invisibleCard;
                        value.hole2 = TexasDef.invisibleCard;
                    }
                }
            });
            console.log(TexasDef.players);
            this.currentPlayerId = TexasDef.currentPlayerId;
            return this;
        }
    }
    TexasDef.Game = Game;
    TexasDef.cardNumber = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    TexasDef.cardType = ['d', 'c', 'h', 's'];
    TexasDef.stageFlop = 1;
    TexasDef.stageTurn = 2;
    TexasDef.stageRiver = 3;
    TexasDef.stageEnd = 4;
    TexasDef.invisibleCard = new Card(-1);
    TexasDef.initialPoint = 10000;
    TexasDef.stagePreFlop = 0;
    TexasDef.cardsNumber = 52;
    TexasDef.currentStage = TexasDef.stageEnd;
    TexasDef.flop = Array(3);
    TexasDef.playerNumber = 0;
    TexasDef.currentCardIndex = 0;
    TexasDef.currentPlayerId = -1;
    TexasDef.cashPool = 0;
    TexasDef.maxCash = 0;
    TexasDef.players = Array();
    function getCardType(index) {
        return TexasDef.cardType[Math.floor(index / 13)];
    }
    TexasDef.getCardType = getCardType;
    function getCardNumber(index) {
        return TexasDef.cardNumber[index % 13];
    }
    TexasDef.getCardNumber = getCardNumber;
    function allPlayers() {
        let newPlayers = Array();
        TexasDef.players.forEach((value) => {
            let user = value.copy();
            newPlayers.push(user);
        });
        return newPlayers;
    }
    TexasDef.allPlayers = allPlayers;
    function drawCard() {
        let card = new Card(TexasDef.totalCards[TexasDef.currentCardIndex]);
        TexasDef.currentCardIndex++;
        return card;
    }
    TexasDef.drawCard = drawCard;
})(TexasDef || (TexasDef = {}));

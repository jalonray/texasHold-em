import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { rankCards } from 'phe';
// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
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
    game(id: ID): Game
}

type Mutation {
    addPlayer(name: String): Game
    playerAction(id: ID, action: PlayerAction): Game
    nextStep(id: ID): Game
    leavePlayer(id: ID): Game
}

enum PlayerAction {
    CALL
    RAISE
    FOLD
    ALL_IN
}
`;
const initialPoint = 10000;
var PlayerAction;
(function (PlayerAction) {
    PlayerAction[PlayerAction["CALL"] = 0] = "CALL";
    PlayerAction[PlayerAction["RAISE"] = 1] = "RAISE";
    PlayerAction[PlayerAction["FOLD"] = 2] = "FOLD";
    PlayerAction[PlayerAction["ALL_IN"] = 3] = "ALL_IN";
})(PlayerAction || (PlayerAction = {}));
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
        cashPool += addCash;
        if (this.cash > maxCash) {
            maxCash = this.cash;
        }
    }
    doAction(action, raise) {
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
    preFlop(newPosition) {
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
        this.flopCards = flop;
        this.turnCard = turn;
        this.riverCard = river;
        this.cashPool = cashPool;
        this.maxCash = maxCash;
        this.players = allPlayers();
        this.players.forEach((value) => {
            if (value.id != id) {
                if (this.winPlayers === null || !this.winPlayers.includes(value.id, 0)) {
                    value.hole1 = null;
                    value.hole2 = null;
                }
            }
        });
        console.log(players);
        this.currentPlayerId = currentPlayerId;
        return this;
    }
}
const stagePreFlop = 0;
const stageFlop = 1;
const stageTurn = 2;
const stageRiver = 3;
const stageEnd = 4;
let currentStage = stageEnd;
let flop = Array(3);
let turn;
let river;
let totalCards;
const cardsNumber = 52;
let playerNumber = 0;
let players = Array();
let currentCardIndex = 0;
let cashPool = 0;
let maxCash = 0;
let currentPlayerId = -1;
const cardNumber = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const cardType = ['d', 'c', 'h', 's'];
function joinPlayer(name) {
    let player = new Player();
    let id = playerNumber;
    player.id = id;
    player.name = name;
    player.point = initialPoint;
    players.push(player);
    playerNumber++;
    return new Game().update(id);
}
function leavePlayer(playerId) {
    let i = -1;
    players.forEach((value, index) => {
        if (value.id === playerId) {
            i = index;
            return;
        }
    });
    if (i > -1) {
        players.splice(i, 1);
        return true;
    }
    return false;
}
function drawCard() {
    let card = new Card(totalCards[currentCardIndex]);
    currentCardIndex++;
    return card;
}
function nextStage(id) {
    currentStage++;
    if (currentStage > stageEnd) {
        currentStage = stagePreFlop;
    }
    switch (currentStage) {
        case stagePreFlop: {
            return startPreFlop(id);
        }
        case stageFlop: {
            return startFlop(id);
        }
        case stageTurn: {
            return startTurn(id);
        }
        case stageRiver: {
            return startRiver(id);
        }
        case stageEnd: {
            return startEnd(id);
        }
    }
}
function startPreFlop(id) {
    if (players.length <= 0) {
        return;
    }
    totalCards = shuffle(Array.from(Array(cardsNumber).keys()));
    currentCardIndex = 0;
    let lastPlayer = players.pop();
    players.splice(0, 0, lastPlayer);
    for (let i = 0; i < players.length; i++) {
        let player = players[i];
        player.preFlop(i);
        if (player.isButton) {
            currentPlayerId = player.id;
        }
    }
    return new Game().update(id);
}
function startFlop(id) {
    flopCards();
    return new Game().update(id);
}
function startTurn(id) {
    turnCard();
    return new Game().update(id);
}
function startRiver(id) {
    riverCard();
    return new Game().update(id);
}
function startEnd(id) {
    let winPlayerIds = [];
    let winPlayerRank = 100;
    let playerRanks = [[]];
    players.forEach((value) => {
        let rank = evaluateCard(value);
        playerRanks.push([value, rank]);
        if (rank < winPlayerRank) {
            winPlayerRank = rank;
        }
    });
    playerRanks.forEach((value) => {
        if (value[1] === winPlayerRank) {
            winPlayerIds.push(value[0]);
        }
    });
    let winCash = Math.floor(cashPool / winPlayerIds.length);
    cashPool = 0;
    playerRanks.forEach((value) => {
        if (value[1] === winPlayerRank) {
            value[0]?.win(winCash);
        }
    });
    let game = new Game();
    game.winPlayers = winPlayerIds;
    return game.update(id);
}
function flopCards() {
    for (let i = 0; i < 3; i++) {
        flop[i] = drawCard();
    }
}
function turnCard() {
    turn = drawCard();
}
function riverCard() {
    river = drawCard();
}
function nextPlayer(id) {
    let index = -1;
    for (let i = 0; i < players.length; i++) {
        if (players[i].id === id) {
            index = i + 1;
            return index;
        }
    }
    if (index >= players.length) {
        index = 0;
    }
    currentPlayerId = players[index].id;
    return currentPlayerId;
}
function allPlayers() {
    let newPlayers = Array();
    players.forEach((value) => {
        let user = value.copy();
        newPlayers.push(user);
    });
    return newPlayers;
}
function evaluateCard(player) {
    if (player === null || player.hole1 === null || player.hole2 === null) {
        return 100;
    }
    let cards = Array();
    cards.push(player.hole1.getDesc());
    cards.push(player.hole2.getDesc());
    if (flop != null && flop.length === 3) {
        flop.forEach((value) => {
            cards.push(value.getDesc());
        });
    }
    if (turn != null) {
        cards.push(turn.getDesc());
    }
    if (river != null) {
        cards.push(river.getDesc());
    }
    return rankCards(cards);
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
function getCardType(index) {
    return cardType[Math.floor(index / 13)];
}
function getCardNumber(index) {
    return cardNumber[index % 13];
}
function doPlayerAction(id, action, raise) {
    players.find((value) => {
        if (value.id === id) {
            return value;
        }
        return null;
    })?.doAction(action, raise);
    nextPlayer(id);
    return new Game().update(id);
}
// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
    Query: {
        game(id) {
            console.log(id);
            return new Game().update(id);
        },
    },
    Mutation: {
        addPlayer: (name) => {
            console.log(name);
            return joinPlayer(name);
        },
        playerAction: (id, action, raise) => {
            console.log(id, action, raise);
            return doPlayerAction(id, action, raise);
        },
        nextStep: (id) => {
            console.log(id);
            return nextStage(id);
        },
        leavePlayer: (id) => {
            console.log(id);
            return leavePlayer(id);
        },
    }
};
// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
    typeDefs,
    resolvers,
});
// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});
console.log(`🚀  Server ready at: ${url}`);

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { rankCards } from 'phe';
import { TexasDef } from '@/components/TypeDescription.ts';
var stageFlop = TexasDef.stageFlop;
var stageTurn = TexasDef.stageTurn;
var stageRiver = TexasDef.stageRiver;
var stageEnd = TexasDef.stageEnd;
var invisibleCard = TexasDef.invisibleCard;
var initialPoint = TexasDef.initialPoint;
var stagePreFlop = TexasDef.stagePreFlop;
var cardsNumber = TexasDef.cardsNumber;
var Player = TexasDef.Player;
var Game = TexasDef.Game;
var drawCard = TexasDef.drawCard;
var typeDefs = TexasDef.typeDefs;
function joinPlayer(name) {
    let player = new Player();
    let id = TexasDef.playerNumber;
    player.id = id;
    player.name = name;
    player.point = initialPoint;
    TexasDef.players.push(player);
    TexasDef.playerNumber++;
    return new Game().update(id);
}
function leavePlayer(playerId) {
    let i = -1;
    TexasDef.players.forEach((value, index) => {
        if (value.id === playerId) {
            i = index;
            return;
        }
    });
    if (i > -1) {
        TexasDef.players.splice(i, 1);
        return true;
    }
    return false;
}
function nextStage(id) {
    TexasDef.currentStage++;
    if (TexasDef.currentStage > stageEnd) {
        TexasDef.currentStage = stagePreFlop;
    }
    switch (TexasDef.currentStage) {
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
    if (TexasDef.players.length <= 0) {
        return;
    }
    TexasDef.totalCards = shuffle(Array.from(Array(cardsNumber).keys()));
    TexasDef.currentCardIndex = 0;
    let lastPlayer = TexasDef.players.pop();
    TexasDef.players.splice(0, 0, lastPlayer);
    for (let i = 0; i < TexasDef.players.length; i++) {
        let player = TexasDef.players[i];
        player.preFlop(i);
        if (player.isButton) {
            TexasDef.currentPlayerId = player.id;
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
    TexasDef.players.forEach((value) => {
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
    let winCash = Math.floor(TexasDef.cashPool / winPlayerIds.length);
    TexasDef.cashPool = 0;
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
        TexasDef.flop[i] = drawCard();
    }
}
function turnCard() {
    TexasDef.turn = drawCard();
}
function riverCard() {
    TexasDef.river = drawCard();
}
function nextPlayer(id) {
    let index = -1;
    for (let i = 0; i < TexasDef.players.length; i++) {
        if (TexasDef.players[i].id === id) {
            index = i + 1;
            break;
        }
    }
    for (let i = index; i < TexasDef.players.length; i++) {
        if (TexasDef.players[i].isEnd != true) {
            index = i;
            break;
        }
    }
    if (index >= TexasDef.players.length) {
        index = 0;
    }
    TexasDef.currentPlayerId = TexasDef.players[index].id;
    return TexasDef.currentPlayerId;
}
function evaluateCard(player) {
    if (player === null || player.hole1 === invisibleCard || player.hole2 === invisibleCard) {
        return 100;
    }
    let cards = Array();
    cards.push(player.hole1.getDesc());
    cards.push(player.hole2.getDesc());
    if (TexasDef.flop != null && TexasDef.flop.length === 3) {
        TexasDef.flop.forEach((value) => {
            cards.push(value.getDesc());
        });
    }
    if (TexasDef.turn != null) {
        cards.push(TexasDef.turn.getDesc());
    }
    if (TexasDef.river != null) {
        cards.push(TexasDef.river.getDesc());
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
function doPlayerAction(id, action, raise) {
    TexasDef.players.find((value) => {
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
        game(parent, args, contextValue, info) {
            const { id } = args;
            console.log(id);
            return new Game().update(id);
        },
    },
    Mutation: {
        addPlayer: (root, args, context) => {
            const { name } = args;
            console.log(name);
            return joinPlayer(name);
        },
        playerAction: (root, args, context) => {
            const { id, action, raise } = args;
            console.log(id, action, raise);
            return doPlayerAction(id, action, raise);
        },
        nextStep: (root, args, context) => {
            const { id } = args;
            console.log(id);
            return nextStage(id);
        },
        leavePlayer: (root, args, context) => {
            const { id } = args;
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

const _D = 'DIRT';
const _G = 'GRASS';
const _S = 'STONE';
const _W = 'WATER';

const types = [_D, _G, _S, _W];

const CONSTANTS = require('./constants.js');

function createTestChunk() {
    const chunk = new Array(CONSTANTS.chunkSize * CONSTANTS.chunkSize * CONSTANTS.chunkHeight);
    for (let i = 0; i < CONSTANTS.chunkSize * CONSTANTS.chunkSize * CONSTANTS.chunkHeight; i++) {
        const rand = Math.floor(Math.random() * 4);

        chunk[i] = types[rand];
    }
    return chunk;
}

function clampToWorldBorder(dimensions, position) {
    position.x = Math.min(CONSTANTS.chunkSize * dimensions.x - 1, position.x);
    position.x = Math.max(-CONSTANTS.chunkSize * dimensions.x, position.x);
    position.y = Math.min(CONSTANTS.chunkSize * dimensions.y - 1, position.y);
    position.y = Math.max(-CONSTANTS.chunkSize * dimensions.y, position.y);
}

module.exports = {
    createLevel: function () {
        const level = {
            world: {
                dimensions: {
                    x: 4,
                    y: 4
                },
                chunks: []
            },
            players: {}
        };

        for (let i = 0; i < level.world.dimensions.x * level.world.dimensions.y * 4; i++) {
            level.world.chunks.push(createTestChunk());
        }

        return level;
    },

    movePlayer: function (level, playerID, dt, direction) {
        const playerPosition = level.players[playerID].position;

        const l = Math.sqrt(direction.x * direction.x + direction.y * direction.y);

        if (l === 0) {
            return;
        }

        playerPosition.x += direction.x / l * dt * 0.01;
        playerPosition.y += direction.y / l * dt * 0.01;

        clampToWorldBorder(level.world.dimensions, playerPosition);
    }
};
const _D = "DIRT";
const _G = "GRASS";
const _S = "STONE";
const _W = "WATER";

module.exports = {
    createLevel: function () {
        return {
            world: {
                dimensions: {
                    x: 10,
                    y: 10,
                    z: 3
                },
                tiles: [
                    _D, _D, _D, _G, _W, _G, _D, _D, _S, _S,
                    _D, _D, _D, _G, _W, _G, _D, _D, _S, _S,
                    _D, _D, _D, _G, _W, _G, _D, _D, _S, _S,
                    _D, _D, _D, _G, _W, _G, _D, _D, _S, _S,
                    _D, _D, _D, _G, _W, _G, _D, _D, _S, _S,
                    _D, _D, _D, _G, _W, _G, _D, _D, _S, _S,
                    _D, _D, _D, _G, _W, _G, _D, _D, _S, _S,
                    _D, _D, _D, _G, _W, _G, _D, _D, _S, _S,
                    _D, _D, _D, _G, _W, _G, _D, _D, _S, _S,
                    _D, _D, _D, _G, _W, _G, _D, _D, _S, _S,

                    _D, _D, _D, _D, _D, _D, _D, _D, _S, _S,
                    _D, _D, _D, _D, _D, _D, _D, _D, _S, _S,
                    _D, _D, _D, _D, _D, _D, _D, _D, _S, _S,
                    _D, _D, _D, _D, _D, _D, _D, _D, _S, _S,
                    _D, _D, _D, _D, _D, _D, _D, _D, _S, _S,
                    _D, _D, _D, _D, _D, _D, _D, _D, _S, _S,
                    _D, _D, _D, _D, _D, _D, _D, _D, _S, _S,
                    _D, _D, _D, _D, _D, _D, _D, _D, _S, _S,
                    _D, _D, _D, _D, _D, _D, _D, _D, _S, _S,
                    _D, _D, _D, _D, _D, _D, _D, _D, _S, _S,

                    _S, _S, _S, _S, _S, _S, _S, _S, _S, _S,
                    _S, _S, _S, _S, _S, _S, _S, _S, _S, _S,
                    _S, _S, _S, _S, _S, _S, _S, _S, _S, _S,
                    _S, _S, _S, _S, _S, _S, _S, _S, _S, _S,
                    _S, _S, _S, _S, _S, _S, _S, _S, _S, _S,
                    _S, _S, _S, _S, _S, _S, _S, _S, _S, _S,
                    _S, _S, _S, _S, _S, _S, _S, _S, _S, _S,
                    _S, _S, _S, _S, _S, _S, _S, _S, _S, _S,
                    _S, _S, _S, _S, _S, _S, _S, _S, _S, _S,
                    _S, _S, _S, _S, _S, _S, _S, _S, _S, _S
                ]
            },
            players: {}
        };
    },

    movePlayer: function (level, playerID, movement) {
        const playerPosition = level.players[playerID].position;

        playerPosition.x += movement.x;
        playerPosition.y += movement.y;

        playerPosition.x = Math.min(level.world.dimensions.x / 2 - 1, playerPosition.x);
        playerPosition.x = Math.max(-level.world.dimensions.x / 2, playerPosition.x);
        playerPosition.y = Math.min(level.world.dimensions.y / 2 - 1, playerPosition.y);
        playerPosition.y = Math.max(-level.world.dimensions.y / 2, playerPosition.y);
    }
};
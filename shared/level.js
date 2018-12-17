module.exports = {
    createLevel: function () {
        return {
            world: {
                dimensions: {
                    x: 10,
                    y: 10
                }
            },
            players: {}
        };
    },

    movePlayer: function (level, playerID, movement) {
        const playerPosition = level.players[playerID].position;

        playerPosition.x += movement.x;
        playerPosition.y += movement.y;

        playerPosition.x = Math.min(level.world.dimensions.x / 2, playerPosition.x);
        playerPosition.x = Math.max(-level.world.dimensions.x / 2, playerPosition.x);
        playerPosition.y = Math.min(level.world.dimensions.y / 2, playerPosition.y);
        playerPosition.y = Math.max(-level.world.dimensions.y / 2, playerPosition.y);
    }
};
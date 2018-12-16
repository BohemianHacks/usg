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
        level.players[playerID].position.x += movement.x;
        level.players[playerID].position.y += movement.y;

        level.players[playerID].position.x = Math.min(level.world.dimensions.x / 2, level.players[playerID].position.x);
        level.players[playerID].position.x = Math.max(-level.world.dimensions.x / 2, level.players[playerID].position.x);
        level.players[playerID].position.y = Math.min(level.world.dimensions.y / 2, level.players[playerID].position.y);
        level.players[playerID].position.y = Math.max(-level.world.dimensions.y / 2, level.players[playerID].position.y);
    }
}
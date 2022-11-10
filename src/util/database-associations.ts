// Setting up database associations.
import Character from '../models/characters.js';
import CharacterOrder from '../models/character-orders.js';

CharacterOrder.belongsTo(Character, { foreignKey: 'charId' });
Character.hasOne(CharacterOrder, { foreignKey: 'charId' });

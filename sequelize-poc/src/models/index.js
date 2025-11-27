const sequelize = require('../database');
const User = require('./User');
const Post = require('./Post');
const Tag = require('./Tag');
const Comment = require('./Comment');

// --- Asociaciones ---

// User-Post (Uno a Muchos)
User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User-Comment (Uno a Muchos)
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Post-Comment (Uno a Muchos)
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// Post-Tag (Muchos a Muchos)
// Se crea una tabla intermedia `PostTag` automáticamente
Post.belongsToMany(Tag, { through: 'PostTag', as: 'tags' });
Tag.belongsToMany(Post, { through: 'PostTag', as: 'posts' });


// Exportamos los modelos y la instancia de sequelize
module.exports = {
  sequelize,
  User,
  Post,
  Tag,
  Comment,
};
